from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import predictor


class _PublicAPIView(APIView):
    # AllowAny + koi authentication nahi: expired JWT bhejne par bhi 401 na aaye
    permission_classes = [AllowAny]
    authentication_classes = []


class SymptomListView(_PublicAPIView):
    """GET /api/ai/symptoms/ → 5 System Check cards (en/ur/roman labels)."""

    def get(self, request):
        items = predictor.symptom_catalog()
        return Response({
            'count': len(items),
            'symptoms': items,
            'model_ready': predictor.model_ready(),
        })


class DiagnoseView(_PublicAPIView):
    """
    POST /api/ai/diagnose/
    {"symptoms": ["fever", "cold_cough", ...], "age": "6–12 months" | 0.75 (years), "duration": "1–2 days" | 2,
     "additional": "notes" (ya "message"), "language": "en" | "ur" | "roman",
     "emergency_hint": true | false}
    Chatbot labels bhi chalte hain: age "0-3m" | "3-12m" | "1-3y" | "3-6y" | "6-18y",
    duration "today" | "1-2d" | "3-5d" | "5d+".
    """

    def post(self, request):
        data = request.data
        symptoms = data.get('symptoms') or []
        if isinstance(symptoms, str):
            symptoms = [s for s in symptoms.split(',') if s.strip()]
        additional = data.get('additional') or data.get('message') or ''

        result, error = predictor.diagnose(
            symptoms=symptoms,
            age=data.get('age'),
            duration=data.get('duration'),
            additional=str(additional)[:2000],
            language=data.get('language'),
            emergency_hint=data.get('emergency_hint') in (True, 'true', 'True', 1, '1'),
        )
        if error == 'no_symptoms':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        if error == 'model':
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(result)
