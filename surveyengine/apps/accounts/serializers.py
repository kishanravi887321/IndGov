
from django.contrib.auth import  get_user_model
from rest_framework import  serializers
import os 
import cloudinary
import cloudinary.uploader  
from django.core.cache import cache
from google.oauth2 import id_token as google_id_token
from rest_framework_simplejwt.tokens import RefreshToken

from  google.auth.transport import requests
from django.conf import settings



User=get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['user', 'admin'], default='user')
    otp = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False)
    orgSecret = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'otp', 'role', 'orgSecret']
        
    def validate(self, data):
        email = data.get('email')
        input_otp = data.get('otp')
        role = data.get('role')
        org_secret = data.get('orgSecret')
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("User with this email already exists.")
            
        # Validate organization secret for admin accounts
        if role == 'admin':
            if not org_secret:
                raise serializers.ValidationError("Organization Secret is required for admin accounts.")
            
            # You can add your organization secret validation logic here
            # For example, check against environment variable or database
            if org_secret !="unique123":
                raise serializers.ValidationError("Invalid Organization Secret.")
            
        # Validate OTP
        key = f"otp:register:{email}"
        stored_otp = cache.get(key)

        if not stored_otp or stored_otp != input_otp:
            raise serializers.ValidationError("Invalid or expired OTP.")

        # OTP is valid, delete it to prevent reuse
        cache.delete(key)
        return data

    def create(self, validated_data):
        validated_data.pop('otp', None)  # Remove otp as it's not needed for user creation
        validated_data.pop('orgSecret', None)  # Remove orgSecret as it's not a user field
        
        # Generate username if not provided
        if not validated_data.get('username'):
            email = validated_data['email']
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = username
            
        return User.objects.create_user(**validated_data)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    otp = serializers.CharField(write_only=True, required=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Only add email as custom claim
        token['email'] = user.email
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        otp = attrs.get('otp')

        if not email:
            raise serializers.ValidationError("Email is required")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")

        # Validate OTP
        stored_otp = cache.get(f"otp:login:{user.email}")
        if stored_otp != otp:
            raise serializers.ValidationError("Invalid or expired OTP.")

        # Validate password
        if not user.check_password(password):
            raise serializers.ValidationError("Password is incorrect")

        # Clear OTP after successful validation
        cache.delete(f"otp:login:{user.email}")

        # Set username for parent serializer to generate token
        attrs['username'] = user.username
        self.user = user

        # Generate token using parent class
        data = super().validate(attrs)

        # Return token only (no extra user info)
        return data

print(settings.GOOGLE_CLIENT_ID)
class LoginGoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

    def validate(self, attrs):
        id_token_value = attrs.get('id_token')

        try:
            # Verify the token with Google's servers
            id_info = google_id_token.verify_oauth2_token(
                id_token_value,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            print(settings.GOOGLE_CLIENT_ID)

            email = id_info.get('email')

            # Try to find existing user, or create with blank username
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': None}  # intentionally skipping username
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            print('verified google token')
            return {
                'accessToken': str(refresh.access_token),

                #
                'refreshToken': str(refresh),
                'username': user.username,
                'email': user.email,
                'is_new_user': created
            }

        except ValueError:
            raise serializers.ValidationError("Invalid Google ID token.")
        except Exception as e:
            raise serializers.ValidationError(str(e))

class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError("Old password is incorrect")
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp= serializers.CharField(write_only=True, required=True, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        # Check if the user exists
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        print('ver')
        if not cache.get(f"otp:forget:{email}") == otp:
            raise serializers.ValidationError({"otp": "Invalid or expired OTP."})
        cache.delete(f"otp:forget:{email}")  # Delete OTP after validation
        print('otp verified')
        return data
    
    
    def save(self, **kwargs):
        email = self.validated_data['email']
        new_password = self.validated_data['new_password']
        
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        return user

      
class UsernameCheckSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

class ProfileImageUploadSerializer(serializers.Serializer):
    profile_image = serializers.ImageField()

    def update(self, instance, validated_data):
        image = validated_data.get("profile_image")

        if not image.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise serializers.ValidationError("Image must be a PNG, JPG, or JPEG file.")

        # Upload to cloudinary
        uploaded = cloudinary.uploader.upload(image)

        # Save the image URL in the model
        instance.profile = uploaded["secure_url"]
        instance.save()

        return instance
    

from ..auth.otpsender import (LoginOtpSender
                              , forgetPasswordOtpSender,RegistrationOtpSender
                              ,UpdatePasswordOtpSender)

class RegistrationOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if  User.objects.filter(email=value).exists():
            print('user exist ')
            raise serializers.ValidationError("User with this email alredy exists.")
        return value

 
    
    def send_register_otp(self):
        email = self.validated_data['email']
        otp_sender = RegistrationOtpSender(email)
        otp = otp_sender.send()
        return otp




class Otpserializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            print('user not exist ')
            raise serializers.ValidationError("User with this email does not exist.")
        return value
   

    def send_forget_password_otp(self):
        email = self.validated_data['email']
        otp_sender = forgetPasswordOtpSender(email)
        otp = otp_sender.send()
        return otp
    def send_update_password_otp(self):
      
        email = self.validated_data['email']
        otp_sender = UpdatePasswordOtpSender(email)
        otp = otp_sender.send()
        return otp
    
    def send_login_otp(self):
        email = self.validated_data['email']
        otp_sender = LoginOtpSender(email)
        otp = otp_sender.send()
        return otp
    
    
class ViewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['role', 'username', 'date_joined','bio', 'email', 'profile', 'social_links','name']  # Include any other fields you want to expose


class ProfileUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['bio', 'username', 'profile', 'social_links', 'name', 'role']
    social_links = serializers.JSONField(default=dict, required=False)

    def update(self, instance, validated_data):
        instance.bio = validated_data.get("bio", instance.bio)
        instance.username = validated_data.get("username", instance.username)
        instance.profile = validated_data.get("profile", instance.profile)
        instance.name = validated_data.get("name", instance.name)
        instance.role = validated_data.get("role", instance.role)

        # Safely update nested social_links dictionary
        social_links_data = validated_data.get("social_links", {})
        current_links = instance.social_links or {}

        for key in ["github", "linkedin", "twitter", "website"]:
            if social_links_data.get(key):
                current_links[key] = social_links_data[key]

        instance.social_links = current_links
        instance.save()
        return instance


class FeedChatifySerializer(serializers.Serializer):
    # email = serializers.EmailField(max_length=1000)
    content = serializers.CharField()


class SurveyGenerationSerializer(serializers.Serializer):
    """
    Serializer for survey generation requests
    """
    description = serializers.CharField(
        max_length=2000,
        help_text="Detailed description of the survey topic and requirements"
    )
    question_count = serializers.IntegerField(
        min_value=3,
        max_value=15,
        default=5,
        help_text="Number of questions to generate (3-15)"
    )
    survey_type = serializers.ChoiceField(
        choices=[
            ('general', 'General Survey'),
            ('government', 'Government Policy'),
            ('health', 'Health & Wellness'),
            ('education', 'Education'),
            ('infrastructure', 'Infrastructure'),
            ('employment', 'Employment'),
            ('social', 'Social Welfare'),
            ('environment', 'Environment'),
            ('technology', 'Technology'),
            ('finance', 'Finance')
        ],
        default='general',
        help_text="Type/category of the survey"
    )
    
    def validate_description(self, value):
        """
        Validate survey description
        """
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Description must be at least 20 characters long"
            )
        return value.strip()
    
    def validate_question_count(self, value):
        """
        Validate question count
        """
        if not isinstance(value, int):
            raise serializers.ValidationError("Question count must be an integer")
        if value < 3 or value > 15:
            raise serializers.ValidationError("Question count must be between 3 and 15")
        return value


# print('T'=="T")