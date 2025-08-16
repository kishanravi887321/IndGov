from rest_framework import generics, status
from rest_framework.views import  APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..serializers import(
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UpdatePasswordSerializer,
    ProfileImageUploadSerializer,Otpserializer,RegistrationOtpSerializer,
    LoginGoogleAuthSerializer,
    ForgetPasswordSerializer,
    UsernameCheckSerializer
    ,ViewUserSerializer
    ,ProfileUpdateSerializer
    ,FeedChatifySerializer,
    SurveyGenerationSerializer

    
    
    
    
    
    )
from ..profile_doc import profile_image_upload_doc
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from ..models import User  # Adjust this import to match your project structure
import json
import logging
import os
import requests
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# 1. Registration View: CreateAPIView auto-documents the request body
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()

# 2. Custom Token Obtain Pair View: Using GenericAPIView with a serializer
class CustomTokenObtainPairView(generics.GenericAPIView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # Will automatically raise a 400 error if not valid
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class ForgetPasswordView(generics.GenericAPIView):
    serializer_class = ForgetPasswordSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=ForgetPasswordSerializer,
        operation_description="Reset password using OTP"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"msg": "Password reset successfully"}, status=status.HTTP_200_OK)      
class UsernameCheckView(generics.GenericAPIView):
    serializer_class = UsernameCheckSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Check if username is available",
        responses={200: "Username is available", 400: "Username already exists"}
    )
    def post(self, request, *args, **kwargs):
     serializer = self.get_serializer(data=request.data)
    
     if serializer.is_valid():
        # Username is available (passed validation)
        return Response({"available": True, "msg": "Username is available"}, status=status.HTTP_200_OK)
     else:
        # Username already exists (failed validation)
        return Response({"available": False, "msg": "Username already exists"}, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=LoginGoogleAuthSerializer,
        operation_description="Login using Google ID Token"
    )
    def post(self, request):
        serializer = LoginGoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






# 3. Update Password View: Using UpdateAPIView with the current user as the object
class UpdatePasswordView(generics.UpdateAPIView):
    serializer_class = UpdatePasswordSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Allow file uploads if needed
    queryset = User.objects.all()  # Required for UpdateAPIView

    def get_object(self):
        # Return the currently authenticated user
        return self.request.user
    @swagger_auto_schema(
        operation_description="Upload profile image",
        request_body=ProfileImageUploadSerializer  # ✅ important!
    )
    def update(self, request, *args, **kwargs):
        # Use partial update if necessary
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"msg": "Password updated successfully"}, status=status.HTTP_200_OK)

# 4. Profile Image Upload View: Using UpdateAPIView to update the current user's profile image
class ProfileImageUploadView(generics.UpdateAPIView):
    serializer_class = ProfileImageUploadSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()  # Required for UpdateAPIView

    def get_object(self):
        # Return the currently authenticated user   
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Pass instance and request data to the serializer; using partial update in case not all fields are provided
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Assuming the user model's "profile" attribute gets updated in the serializer's update() method
        return Response(
            {"msg": "Profile image updated successfully", "url": instance.profile},
            status=status.HTTP_200_OK
        )

class AuthForRegistration(APIView):
 
    permission_classes = [AllowAny]
    @swagger_auto_schema(request_body=RegistrationOtpSerializer)
    def post(self, request):
        serializer = RegistrationOtpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.send_register_otp()
            return Response({"msg": "OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AuthforUpdatePassword(APIView):
    permission_classes=[IsAuthenticated]
    
    @swagger_auto_schema(request_body=Otpserializer)
    def post(self,request):
        serializer= Otpserializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.send_update_password_otp()
            return Response({"msg": "OTP sent successfully"}, status=status.HTTP_200_OK)   
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AuthforForgetPassword(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=Otpserializer)
    def post(self, request):
        serializer = Otpserializer(data=request.data)
        if serializer.is_valid():
            serializer.send_forget_password_otp()
            return Response({"msg": "OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
    
class AuthforLogin(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=Otpserializer)
    def post(self, request):
        serializer = Otpserializer(data=request.data)
        if serializer.is_valid():
            serializer.send_login_otp()
            return Response({"msg": "OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ViewUser(generics.RetrieveAPIView):
    serializer_class = ViewUserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()  # Required for RetrieveAPIView

    def get_object(self):
        # Return the currently authenticated user
        return self.request.user

    @swagger_auto_schema(
        operation_description="Retrieve user profile",
        responses={200: ProfileImageUploadSerializer}
    )
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(
        operation_description="Update user profile",
        request_body=ProfileUpdateSerializer
    )
    def update(self, request, *args, **kwargs):
        print(request.data, "the data is ")

        data = request.data.copy()
        # Make sure to get raw values, not lists (if coming from form-data)
        social_links = {
            "linkedin": data.pop("linkedin", None),
            "github": data.pop("github", None),
            "twitter": data.pop("twitter", None),
            "website": data.pop("website", None),
        }

        # Remove None values
        social_links = {k: v for k, v in social_links.items() if v is not None}
        data["social_links"] = social_links

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"msg": "Profile updated successfully"}, status=status.HTTP_200_OK)


import requests

class FeedChatifyView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Feed Chatify",
        request_body=FeedChatifySerializer
    )
    def post(self, request):
        serializer = FeedChatifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"msg": "Chatify feed update failed"}, status=status.HTTP_401_UNAUTHORIZED)
        user = request.user
        email = user.email
        raw_text = serializer.validated_data.get("content")
        print(raw_text, "the raw text is ")
        if len(raw_text) > 10000:
            print('exceed')
            return Response({"msg": "Content exceeds maximum length of 6000 characters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.post(
                "http://localhost:8005/chat/feed/",
                json={"email": email, "raw_text": raw_text},timeout=30
            )
            if response.status_code == 200:
                print(response.json(), "the response is ")
                return Response({"msg": "Chatify feed updated successfully","data":
                                 response.json()}, status=status.HTTP_200_OK)
            else:
                return Response({"msg": "Failed to update Chatify feed"}, status=status.HTTP_400_BAD_REQUEST)


        except requests.exceptions.RequestException as e:
            return Response({"msg": "internal server error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SurveyGenerationView(APIView):
    """
    API view for generating survey questions using Gemini AI
    """
    permission_classes = [IsAuthenticated]
    
    def __init__(self):
        super().__init__()
        self.gemini_api_key = os.getenv("GOOGLE_API_KEY")
        if not self.gemini_api_key:
            logger.error("GOOGLE_API_KEY not found in environment variables")

    def ask_gemini(self, query: str, system_message: str = None):
        """
        Direct Gemini API integration for generating survey questions
        """
        if not self.gemini_api_key:
            return {"message": "Server configuration error: Missing Gemini API key."}, 500

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"

        # Combine system message and query
        full_prompt = f"{system_message}\n\n{query}" if system_message else query

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'candidates' in data and len(data['candidates']) > 0:
                if 'content' in data['candidates'][0] and 'parts' in data['candidates'][0]['content']:
                    return data['candidates'][0]['content']['parts'][0]['text']
            
            return "Sorry, I couldn't generate a response."
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API request failed: {e}")
            return f"API request failed: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error in Gemini API call: {e}")
            return f"Unexpected error: {str(e)}"

    @swagger_auto_schema(
        request_body=SurveyGenerationSerializer,
        responses={
            200: {
                'description': 'Survey questions generated successfully',
                'examples': {
                    'application/json': {
                        'status': 'success',
                        'questions': [
                            {
                                'id': '1',
                                'type': 'multiple-choice',
                                'question': 'How would you rate the current service quality?',
                                'options': ['Excellent', 'Good', 'Average', 'Poor'],
                                'required': True
                            }
                        ],
                        'metadata': {
                            'description': 'Survey about service quality',
                            'question_count': 5,
                            'survey_type': 'government',
                            'ai_generated': True,
                            'model': 'gemini-1.5-flash'
                        }
                    }
                }
            },
            400: {'description': 'Invalid request data'},
            401: {'description': 'Authentication required'},
            500: {'description': 'Internal server error'}
        }
    )
    def post(self, request):
        """
        Generate survey questions based on description using Gemini AI
        
        This endpoint uses advanced AI to generate contextually relevant survey questions
        based on your description. Perfect for creating government surveys, policy feedback
        forms, and data collection instruments.
        """
        try:
            # Validate request data using serializer
            serializer = SurveyGenerationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    "status": "error",
                    "message": "Invalid request data",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            description = validated_data['description']
            question_count = validated_data['question_count']
            survey_type = validated_data['survey_type']
            
            if not self.gemini_api_key:
                return Response({
                    "status": "error",
                    "message": "AI service configuration error. Please contact administrator."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Generate survey questions using Gemini
            questions = self._generate_survey_questions(description, question_count, survey_type)
            
            if not questions:
                return Response({
                    "status": "error",
                    "message": "Failed to generate survey questions"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                "status": "success",
                "questions": questions,
                "metadata": {
                    "description": description,
                    "question_count": len(questions),
                    "survey_type": survey_type,
                    "ai_generated": True,
                    "model": "gemini-1.5-flash",
                    "generated_by": request.user.email if request.user.is_authenticated else "anonymous"
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in survey generation: {e}")
            return Response({
                "status": "error",
                "message": "Internal server error occurred"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_survey_questions(self, description: str, question_count: int, survey_type: str) -> List[Dict[str, Any]]:
        """
        Generate survey questions using Gemini AI
        
        Args:
            description: Survey description and requirements
            question_count: Number of questions to generate
            survey_type: Type of survey
            
        Returns:
            List of generated questions with options
        """
        try:
            # Create system message for survey generation
            system_message = f"""
You are an expert survey designer for government and organizational research. Your task is to create high-quality, unbiased survey questions that will gather meaningful data.

🎯 Survey Context:
- Type: {survey_type}
- Purpose: Data collection for policy making and analysis
- Target: General public/citizens
- Format: Digital survey platform

📋 Requirements:
1. Generate EXACTLY {question_count} questions
2. Mix different question types: multiple-choice, yes-no, rating, text
3. Questions should be clear, unbiased, and professionally written
4. Include 2-5 relevant options for multiple-choice questions
5. Ensure questions gather actionable insights
6. Use simple, accessible language
7. Avoid leading or loaded questions

🏛️ Government Survey Best Practices:
- Neutral and objective tone
- Culturally sensitive language
- Accessibility for all education levels
- Data privacy considerations
- Actionable for policy decisions

📝 Output Format (JSON):
Return ONLY a valid JSON array where each question object has:
{{
  "id": "1", 
  "type": "multiple-choice" | "text" | "yes-no" | "rating",
  "question": "Clear question text",
  "options": ["option1", "option2", "option3"] (only for multiple-choice),
  "required": true/false
}}

🚫 Avoid:
- Personal or sensitive information requests
- Leading questions that suggest desired answers
- Overly technical jargon
- Questions that could be discriminatory
"""

            # Create the prompt for question generation
            prompt = f"""
Based on the following survey description, generate {question_count} professional survey questions:

DESCRIPTION: "{description}"

Requirements:
- Create a mix of question types (multiple-choice, yes-no, rating, text)
- Questions should directly relate to the survey description
- Include clear, actionable options for multiple-choice questions
- Make questions accessible to general public
- Ensure questions will provide valuable insights for decision-making

Please generate the questions as a JSON array following the specified format. Return ONLY the JSON array, no additional text.
"""

            # Generate response using Gemini
            response = self.ask_gemini(prompt, system_message)
            
            # Parse the JSON response
            questions = self._parse_ai_response(response, question_count)
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating survey questions: {e}")
            return self._create_fallback_questions(question_count)
    
    def _parse_ai_response(self, response: str, expected_count: int) -> List[Dict[str, Any]]:
        """
        Parse AI response and extract survey questions
        
        Args:
            response: Raw AI response
            expected_count: Expected number of questions
            
        Returns:
            List of parsed question objects
        """
        try:
            # Try to extract JSON from response
            response_clean = response.strip()
            
            # Find JSON array in response
            start_idx = response_clean.find('[')
            end_idx = response_clean.rfind(']') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_clean[start_idx:end_idx]
                questions = json.loads(json_str)
                
                # Validate and format questions
                formatted_questions = []
                for i, q in enumerate(questions[:expected_count]):
                    formatted_q = self._format_question(q, i + 1)
                    if formatted_q:
                        formatted_questions.append(formatted_q)
                
                return formatted_questions
            
            # Fallback: create default questions if parsing fails
            return self._create_fallback_questions(expected_count)
            
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            logger.error(f"Error parsing AI response: {e}")
            return self._create_fallback_questions(expected_count)
    
    def _format_question(self, question_data: Dict, question_id: int) -> Dict[str, Any]:
        """
        Format and validate a single question
        
        Args:
            question_data: Raw question data from AI
            question_id: Question ID number
            
        Returns:
            Formatted question object or None if invalid
        """
        try:
            formatted = {
                "id": str(question_id),
                "type": question_data.get('type', 'text'),
                "question": question_data.get('question', '').strip(),
                "required": question_data.get('required', True)
            }
            
            # Validate question type
            valid_types = ['multiple-choice', 'text', 'yes-no', 'rating']
            if formatted['type'] not in valid_types:
                formatted['type'] = 'text'
            
            # Add options for multiple-choice questions
            if formatted['type'] == 'multiple-choice':
                options = question_data.get('options', [])
                if isinstance(options, list) and len(options) >= 2:
                    formatted['options'] = [str(opt).strip() for opt in options[:5]]  # Max 5 options
                else:
                    # Convert to text if no valid options
                    formatted['type'] = 'text'
            
            # Validate question text
            if len(formatted['question']) < 10:
                return None
                
            return formatted
            
        except Exception as e:
            logger.error(f"Error formatting question: {e}")
            return None
    
    def _create_fallback_questions(self, count: int) -> List[Dict[str, Any]]:
        """
        Create fallback questions if AI generation fails
        
        Args:
            count: Number of questions to create
            
        Returns:
            List of fallback question objects
        """
        fallback_questions = [
            {
                "id": "1",
                "type": "multiple-choice", 
                "question": "How would you rate your overall satisfaction with current services?",
                "options": ["Excellent", "Good", "Average", "Poor", "Very Poor"],
                "required": True
            },
            {
                "id": "2",
                "type": "yes-no",
                "question": "Do you think improvements are needed in this area?", 
                "required": True
            },
            {
                "id": "3",
                "type": "rating",
                "question": "On a scale of 1-5, how important is this topic to you?",
                "required": True
            },
            {
                "id": "4", 
                "type": "text",
                "question": "What specific improvements would you suggest?",
                "required": False
            },
            {
                "id": "5",
                "type": "multiple-choice",
                "question": "What is your primary concern in this area?",
                "options": ["Accessibility", "Quality", "Cost", "Availability", "Other"],
                "required": True
            }
        ]
        
        return fallback_questions[:count]
        






