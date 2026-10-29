from django.test import SimpleTestCase
from rest_framework.test import APIClient

from . import predictor


class ParsingTests(SimpleTestCase):
    def test_age_labels_to_months(self):
        self.assertEqual(predictor.parse_age_months('0–3 months'), 1.5)
        self.assertEqual(predictor.parse_age_months('6–12 months'), 9.0)
        self.assertEqual(predictor.parse_age_months('1–2 years'), 18.0)
        self.assertEqual(predictor.parse_age_months('2–5 years'), 42.0)
        self.assertEqual(predictor.parse_age_months(1), 12.0)          # number = years

    def test_chatbot_labels(self):
        ages = {'0-3m': 1.5, '3-12m': 7.0, '1-3y': 24.0, '3-6y': 54.0, '6-18y': 144.0}
        for label, months in ages.items():
            self.assertEqual(predictor.parse_age_months(label), months)
        days = {'today': 0.5, '1-2d': 1.5, '3-5d': 4.0, '5d+': 7.0}
        for label, d in days.items():
            self.assertEqual(predictor.parse_duration_days(label), d)

    def test_duration_labels_to_days(self):
        self.assertEqual(predictor.parse_duration_days('Less than 1 day'), 1.0)
        self.assertEqual(predictor.parse_duration_days('1–2 days'), 1.5)
        self.assertEqual(predictor.parse_duration_days('3–5 days'), 4.0)
        self.assertEqual(predictor.parse_duration_days('More than 5 days'), 7.0)
        self.assertEqual(predictor.parse_duration_days('2 weeks'), 14.0)

    def test_notes_keywords_and_negation(self):
        self.assertEqual(predictor.cards_from_text('Bachay ko khansi aur dast hai'), {'cold_cough', 'diarrhea'})
        self.assertEqual(predictor.cards_from_text('bukhar nahi hai, no fever'), set())
        self.assertEqual(predictor.danger_from_text('saans theek hai'), set())
        self.assertIn('breathing', predictor.danger_from_text('saans lene mein mushkil'))


class DiagnoseAPITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def post(self, payload, **extra):
        return self.client.post('/api/ai/diagnose/', payload, format='json', **extra)

    # ── Task ki acceptance misalein ──
    def test_infant_fever_is_emergency(self):
        body = self.post({'symptoms': ['fever'], 'age': '0–3 months', 'duration': '1–2 days'}).json()
        self.assertTrue(body['emergency'])
        self.assertIsNone(body['treatment'])
        self.assertTrue(body['disclaimer'])

    def test_diarrhea_fever_one_year(self):
        body = self.post({'symptoms': ['diarrhea', 'fever'], 'age': 1, 'duration': '1–2 days',
                          'language': 'en'}).json()
        self.assertEqual(body['condition_key'], 'Diarrhea')
        self.assertFalse(body['emergency'])
        self.assertIn('ORS', body['treatment']['organic'])
        self.assertIn('Zinc 20 mg', body['treatment']['organic'])

    def test_teething_sleep_eight_months(self):
        body = self.post({'symptoms': ['teething_pain', 'sleep_issues'], 'age': '8 months',
                          'duration': '3–5 days', 'language': 'en'}).json()
        self.assertEqual(body['condition_key'], 'Teething')
        self.assertIn('FDA WARNING', body['homeopathic_warning'])
        self.assertIn('teething ring', body['treatment']['organic'])

    def test_cold_cough_two_years(self):
        body = self.post({'symptoms': ['cold_cough'], 'age': '2 years', 'duration': '3–5 days',
                          'language': 'roman'}).json()
        self.assertEqual(body['condition_key'], 'Cold & Cough')
        self.assertIn('1 saal se baray', body['treatment']['organic'])

    # ── Chatbot scenarios (chatbot_flow.json labels) ──
    def test_chat_infant_fever_emergency(self):
        body = self.post({'symptoms': ['fever'], 'age': '0-3m', 'duration': '1-2d',
                          'language': 'roman', 'emergency_hint': False}).json()
        self.assertTrue(body['emergency'])
        self.assertIsNone(body['treatment'])

    def test_chat_emergency_hint(self):
        body = self.post({'symptoms': ['cold_cough'], 'age': '3-6y', 'duration': 'today',
                          'emergency_hint': True}).json()
        self.assertTrue(body['emergency'])
        self.assertIn('Danger sign reported in the chat', body['emergency_reasons'])

    def test_chat_teething(self):
        body = self.post({'symptoms': ['teething_pain'], 'age': '3-12m', 'duration': '1-2d',
                          'additional': 'Drooling', 'language': 'en', 'emergency_hint': False}).json()
        self.assertEqual(body['condition_key'], 'Teething')
        self.assertFalse(body['emergency'])
        self.assertIn('FDA WARNING', body['homeopathic_warning'])

    def test_chat_cold_cough(self):
        body = self.post({'symptoms': ['cold_cough'], 'age': '1-3y', 'duration': '3-5d',
                          'additional': 'Dry cough', 'language': 'en', 'emergency_hint': False}).json()
        self.assertEqual(body['condition_key'], 'Cold & Cough')
        self.assertFalse(body['emergency'])
        self.assertIn('honey', body['treatment']['organic'].lower())

    # ── Baqi rules ──
    def test_old_card_ids_still_work(self):
        res = self.post({'symptoms': ['cough', 'sleep'], 'age': '2–5 years', 'duration': '1–2 days'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['input']['cards'], ['cold_cough', 'sleep_issues'])

    def test_teething_with_fever_is_red_flag(self):
        body = self.post({'symptoms': ['teething_pain', 'fever'], 'age': '6–12 months', 'duration': '1–2 days'}).json()
        self.assertTrue(body['emergency'])

    def test_blood_in_notes_urdu_autodetect(self):
        body = self.post({'symptoms': ['diarrhea'], 'age': '2–5 years', 'duration': '1–2 days',
                          'message': 'پاخانے میں خون آ رہا ہے'}).json()
        self.assertEqual(body['language'], 'ur')
        self.assertTrue(body['emergency'])

    def test_freetext_complaint_without_cards(self):
        body = self.post({'symptoms': [], 'age': '1-3y', 'duration': '1-2d',
                          'additional': 'bachay ko khansi hai'}).json()
        self.assertEqual(body['input']['cards'], ['cold_cough'])

    def test_empty_symptoms_friendly_error(self):
        res = self.post({'symptoms': [], 'age': '1–2 years', 'duration': '1–2 days', 'language': 'roman'})
        self.assertEqual(res.status_code, 400)
        self.assertIn('select', res.json()['error'])

    def test_invalid_token_still_allowed(self):
        res = self.post({'symptoms': ['fever'], 'age': 3, 'duration': 2},
                        HTTP_AUTHORIZATION='Bearer expired.token.here')
        self.assertEqual(res.status_code, 200)

    def test_symptom_list(self):
        body = self.client.get('/api/ai/symptoms/').json()
        self.assertEqual(body['count'], 5)
        self.assertEqual(body['symptoms'][0], {'key': 'fever', 'en': 'Fever', 'ur': 'بخار', 'roman': 'Bukhar'})
