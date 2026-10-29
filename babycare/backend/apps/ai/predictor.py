"""
System Check — 5-condition model (Fever, Cold & Cough, Teething, Diarrhea, Sleep Issues).

model.pkl ml/train.py se banta hai. Frontend ke 5 card IDs, age/duration labels
("6–12 months", "1–2 days") aur notes (English / Roman Urdu / Urdu) yahan
model ke feature vector mein convert hote hain. Treatment text knowledge_base.json
(ml/BabyCare_5_Conditions_Research.md se) se aata hai.
"""
import json
import re
from pathlib import Path

import joblib
import pandas as pd
from django.conf import settings

MODEL_PATH = Path(settings.BASE_DIR) / 'ml' / 'model.pkl'
KB_PATH = Path(__file__).resolve().parent / 'knowledge_base.json'

LANGUAGES = ('en', 'ur', 'roman')

# Module-level load (server start par ek dafa)
try:
    _bundle = joblib.load(MODEL_PATH)
    MODEL_ERROR = None
except Exception as exc:  # model.pkl missing / sklearn version mismatch
    _bundle = None
    MODEL_ERROR = f'{type(exc).__name__}: {exc}'

KB = json.loads(KB_PATH.read_text(encoding='utf-8'))['conditions']

CARDS = ['fever', 'cold_cough', 'teething_pain', 'diarrhea', 'sleep_issues']
FEATURES = _bundle['features'] if _bundle else CARDS + ['age_months', 'duration_days']

# Frontend card IDs (naye feature keys + purane IDs) → model feature
CARD_ALIASES = {
    'fever': 'fever',
    'cold_cough': 'cold_cough', 'cough': 'cold_cough', 'cold & cough': 'cold_cough',
    'teething_pain': 'teething_pain', 'teething': 'teething_pain',
    'diarrhea': 'diarrhea', 'diarrhoea': 'diarrhea',
    'sleep_issues': 'sleep_issues', 'sleep': 'sleep_issues',
}

CARD_LABELS = {
    'fever':         {'en': 'Fever',         'ur': 'بخار',             'roman': 'Bukhar'},
    'cold_cough':    {'en': 'Cold & Cough',  'ur': 'نزلہ زکام/کھانسی', 'roman': 'Nazla Zukaam / Khansi'},
    'teething_pain': {'en': 'Teething Pain', 'ur': 'دانت نکلنے کا درد', 'roman': 'Daant nikalne ka dard'},
    'diarrhea':      {'en': 'Diarrhea',      'ur': 'دست',              'roman': 'Dast'},
    'sleep_issues':  {'en': 'Sleep Issues',  'ur': 'نیند کے مسائل',    'roman': 'Neend ke masail'},
}

# Notes ke keywords → card
NOTE_KEYWORDS = {
    'fever': ['fever', 'temperature', 'bukhar', 'bukhaar', 'بخار'],
    'cold_cough': ['cough', 'common cold', 'runny nose', 'blocked nose', 'sneez', 'khansi', 'khaansi',
                   'zukaam', 'zukam', 'nazla', 'کھانسی', 'زکام', 'نزلہ', 'چھینک'],
    'diarrhea': ['diarrhea', 'diarrhoea', 'loose motion', 'loose stool', 'watery stool', 'dast', 'دست', 'اسہال'],
    'teething_pain': ['teething', 'teeth', 'tooth', 'gums', 'daant', 'dant', 'masooray', 'masoore', 'دانت', 'مسوڑ'],
    'sleep_issues': ['sleep', 'night waking', 'neend', 'neind', 'نیند'],
}

# Notes mein ye → emergency
DANGER_NOTES = {
    'breathing': ['difficulty breathing', 'trouble breathing', "can't breathe", 'cannot breathe', 'not breathing',
                  'breathless', 'saans', 'سانس'],
    'unconscious': ['unconscious', 'fainted', 'not waking', 'behosh', 'be hosh', 'بے ہوش', 'بیہوش'],
    'blue_lips': ['blue lips', 'lips blue', 'lips are blue', 'turning blue', 'neelay hont', 'neele hont',
                  'hont neelay', 'hont neele', 'نیلے ہونٹ', 'ہونٹ نیلے'],
    'seizure': ['seizure', 'convulsion', 'fits', 'daura', 'mirgi', 'jhatke', 'دورہ', 'دورے', 'مرگی', 'جھٹکے'],
    'dehydration': ['dehydrat', 'paani ki kami', 'pani ki kami', 'no urine', 'no tears', 'sunken eyes',
                    'پانی کی کمی'],
    'blood': ['blood', 'bloody', 'khoon', 'khun', 'خون'],
    'high_fever': ['high fever', 'very high fever', 'tez bukhar', 'shadeed bukhar', 'تیز بخار'],
}
# Keyword ke foran pehle/baad ye aaye to ignore ("bukhar nahi", "no fever", "saans theek hai")
NEGATIONS = ('nahi', 'nahin', 'nai', 'no', 'not', 'without', 'theek', 'thik', 'normal', 'fine', 'نہیں', 'ٹھیک')

DISCLAIMER = {
    'en': 'This is only preliminary guidance, not a replacement for a real doctor.',
    'ur': 'یہ صرف ابتدائی رہنمائی ہے، اصل ڈاکٹر کا متبادل نہیں۔',
    'roman': 'Ye sirf ibtidai rahnumai hai, asli doctor ka badal nahi.',
}
EMERGENCY_MESSAGE = {
    'en': 'Possible emergency — see a doctor immediately or go to the nearest hospital. You can book a doctor appointment now.',
    'ur': 'ممکنہ ایمرجنسی — فوراً ڈاکٹر سے ملیں یا قریبی ہسپتال جائیں۔ آپ ابھی ڈاکٹر کی اپائنٹمنٹ بک کر سکتے ہیں۔',
    'roman': 'Mumkina emergency — turant doctor se milein ya qareebi hospital jayein. Aap abhi doctor ki appointment book kar sakte hain.',
}
REASONS = {
    'infant_fever': {'en': 'Fever in a baby under 3 months', 'ur': 'تین ماہ سے کم عمر بچے کو بخار',
                     'roman': '3 maah se kam umar bachay ko bukhar'},
    'long_fever': {'en': 'Fever lasting more than 5 days', 'ur': 'بخار پانچ دن سے زیادہ',
                   'roman': 'Bukhar 5 din se zyada'},
    'infant_diarrhea': {'en': 'Watery diarrhoea in a baby under 1 year', 'ur': 'ایک سال سے کم عمر بچے کو دست',
                        'roman': '1 saal se kam umar bachay ko dast'},
    'dehydration': {'en': 'Signs of dehydration', 'ur': 'پانی کی کمی کی علامات', 'roman': 'Paani ki kami ki alamaat'},
    'blood': {'en': 'Blood mentioned (e.g. in stool)', 'ur': 'خون کا ذکر (مثلاً پاخانے میں)',
              'roman': 'Khoon ka zikr (maslan paakhane mein)'},
    'breathing': {'en': 'Breathing difficulty', 'ur': 'سانس میں دقت', 'roman': 'Saans mein mushkil'},
    'unconscious': {'en': 'Unconscious / very hard to wake', 'ur': 'بے ہوشی', 'roman': 'Behoshi'},
    'blue_lips': {'en': 'Blue lips', 'ur': 'نیلے ہونٹ', 'roman': 'Neelay hont'},
    'seizure': {'en': 'Seizure / fits', 'ur': 'دورہ / جھٹکے', 'roman': 'Daura / jhatke'},
    'chat_red_flag': {'en': 'Danger sign reported in the chat', 'ur': 'چیٹ میں خطرے کی علامت بتائی گئی',
                      'roman': 'Chat mein khatre ki alamat batayi gayi'},
    'teething_red_flag': {'en': 'Fever or diarrhoea with teething — this is not teething',
                          'ur': 'دانت نکلنے کے ساتھ بخار یا دست — یہ دانت نکلنا نہیں',
                          'roman': 'Daant nikalne ke saath bukhar ya dast — ye daant nikalna nahi'},
}
ERRORS = {
    'no_symptoms': {
        'en': 'Please select at least one symptom so we can check.',
        'ur': 'براہِ کرم کم از کم ایک علامت منتخب کریں۔',
        'roman': 'Barah-e-karam kam az kam ek alamat select karein.',
    },
    'model': {
        'en': 'The System Check model is not available right now. Please try again later.',
        'ur': 'سسٹم چیک ماڈل ابھی دستیاب نہیں۔ براہِ کرم بعد میں کوشش کریں۔',
        'roman': 'System Check model abhi available nahi. Barah-e-karam baad mein koshish karein.',
    },
}

# Is se kam top-1 confidence par user ko batao ke andaza kamzor hai
LOW_CONFIDENCE = 50.0
LOW_CONFIDENCE_NOTE = {
    'en': 'Low confidence — the symptoms fit more than one condition. Please consult a doctor.',
    'ur': 'کم یقین — علامات ایک سے زیادہ کیفیات سے ملتی ہیں۔ براہِ کرم ڈاکٹر سے مشورہ کریں۔',
    'roman': 'Kam yaqeen — alamaat ek se zyada conditions se milti hain. Barah-e-karam doctor se mashwara karein.',
}


def model_ready():
    return _bundle is not None


def symptom_catalog():
    return [{'key': key, **CARD_LABELS[key]} for key in CARDS]


# ── Parsing helpers ──
_NUM = re.compile(r'\d+(?:\.\d+)?')
_URDU_SCRIPT = re.compile(r'[؀-ۿ]')


def _midpoint(text):
    nums = [float(n) for n in _NUM.findall(text)][:2]
    return sum(nums) / len(nums) if nums else None


def _has_any(text, words):
    return any(w in text for w in words)


# Chatbot ke age/duration labels (frontend/src/data/chatbot_flow.json) → midpoint
AGE_LABELS = {'0-3m': 1.5, '3-12m': 7.0, '1-3y': 24.0, '3-6y': 54.0, '6-18y': 144.0}
DURATION_LABELS = {'today': 0.5, '1-2d': 1.5, '3-5d': 4.0, '5d+': 7.0}


def _label_key(value):
    return str(value).strip().lower().replace('–', '-').replace(' ', '')


def parse_age_months(value):
    """'0-3m' → 1.5, '3-12m' → 7, '1-3y' → 24 …; '0–3 months' → 1.5, '1–2 years' → 18; number = years (×12)."""
    if value in (None, ''):
        return None
    if isinstance(value, str) and _label_key(value) in AGE_LABELS:
        return AGE_LABELS[_label_key(value)]
    if isinstance(value, (int, float)):
        months = float(value) * 12
    else:
        text = str(value).lower()
        n = _midpoint(text)
        if n is None:
            return None
        if _has_any(text, ('month', 'maah', 'mahine', 'ماہ', 'مہینے')):
            months = n
        elif _has_any(text, ('week', 'hafte', 'ہفت')):
            months = n / 4.345
        elif _has_any(text, ('day', 'din', 'دن')):
            months = n / 30.4
        else:
            months = n * 12          # "1–2 years", "3"
    return round(min(max(months, 1.0), 216.0), 1)


def parse_duration_days(value):
    """'today' → 0.5, '1-2d' → 1.5, '3-5d' → 4, '5d+' → 7; 'More than 5 days' → 7, '2 weeks' → 14."""
    if value in (None, ''):
        return None
    if isinstance(value, str) and _label_key(value) in DURATION_LABELS:
        return DURATION_LABELS[_label_key(value)]
    if isinstance(value, (int, float)):
        days = float(value)
    else:
        text = str(value).lower()
        n = _midpoint(text)
        if n is None:
            return None
        if _has_any(text, ('week', 'hafte', 'ہفت')):
            n *= 7
        elif _has_any(text, ('month', 'maah', 'mahine', 'ماہ')):
            n *= 30
        elif _has_any(text, ('hour', 'ghante', 'گھنٹ')):
            n /= 24
        if _has_any(text, ('more than', 'zyada', 'زیادہ')):
            n *= 1.4                 # "More than 5 days" → 7
        days = n
    return round(min(max(days, 1.0), 60.0), 1)


def _find(text, phrase):
    """Phrase dhoondo, negation ('bukhar nahi', 'no fever', 'saans theek hai') ko chhor kar."""
    if _URDU_SCRIPT.search(phrase):
        pattern = re.escape(phrase)
    else:
        pattern = rf'(?<![a-z0-9]){re.escape(phrase)}'
        if not phrase.endswith(('sneez', 'dehydrat')):   # prefix match: sneezing, dehydration
            pattern += r'(?![a-z0-9])'
    for m in re.finditer(pattern, text):
        before = text[max(0, m.start() - 12):m.start()].split()
        after = [w.strip('.,!?،۔') for w in text[m.end():m.end() + 16].split()]
        if (before and before[-1] in NEGATIONS) or any(w in NEGATIONS for w in after[:2]):
            continue
        return True
    return False


def _normalize(text):
    return ' '.join(str(text or '').lower().split())


def cards_from_text(text):
    t = _normalize(text)
    return {card for card, words in NOTE_KEYWORDS.items() if any(_find(t, w) for w in words)}


def danger_from_text(text):
    t = _normalize(text)
    return {key for key, words in DANGER_NOTES.items() if any(_find(t, w) for w in words)}


def detect_language(requested, text):
    if requested in LANGUAGES:
        return requested
    if text and _URDU_SCRIPT.search(str(text)):
        return 'ur'
    return 'en'


def resolve_cards(items):
    """Returns (matched card set, unknown list)."""
    matched, unknown = set(), []
    for raw in items or []:
        key = CARD_ALIASES.get(str(raw).strip().lower())
        if key:
            matched.add(key)
        else:
            unknown.append(raw)
    return matched, unknown


def diagnose(symptoms, age, duration, additional='', language=None, emergency_hint=False):
    """Returns (response dict, error key or None)."""
    notes = str(additional or '')
    lang = detect_language(language, notes)

    selected, unknown = resolve_cards(symptoms)
    if not selected:
        # Chatbot mein main complaint likh kar di ho ("bachay ko dast hai") → notes se cards
        selected = cards_from_text(notes)
    if not selected:
        return {'error': ERRORS['no_symptoms'][lang], 'language': lang, 'unknown_symptoms': unknown}, 'no_symptoms'
    if not model_ready():
        return {'error': ERRORS['model'][lang], 'language': lang}, 'model'

    from_notes = cards_from_text(notes) - selected
    present = selected | from_notes

    age_months = parse_age_months(age)
    duration_days = parse_duration_days(duration)
    # Missing values → dataset median
    age_used = age_months if age_months is not None else 43.8
    duration_used = duration_days if duration_days is not None else 6.0

    row = {f: 0 for f in FEATURES}
    for card in present:
        row[card] = 1
    row['age_months'] = age_used
    row['duration_days'] = max(duration_used, 1.0)   # dataset min 1 din ('today' = 0.5)
    X = pd.DataFrame([row], columns=FEATURES)

    model = _bundle['model']
    proba = model.predict_proba(X)[0]
    ranked = sorted(zip(model.classes_, proba), key=lambda cp: cp[1], reverse=True)
    condition, confidence = ranked[0]
    entry = KB[condition]
    text = entry[lang]

    # ── Emergency rules (research doc ke mutabiq) ──
    danger = danger_from_text(notes)
    reasons = []
    if 'fever' in present and age_months is not None and age_months < 3:
        reasons.append('infant_fever')
    if 'fever' in present and duration_days is not None and duration_days > 5:
        reasons.append('long_fever')
    if 'diarrhea' in present and age_months is not None and age_months < 12:
        reasons.append('infant_diarrhea')
    for key in ('dehydration', 'blood', 'breathing', 'unconscious', 'blue_lips', 'seizure'):
        if key in danger:
            reasons.append(key)
    if 'teething_pain' in present and ({'fever', 'diarrhea'} & present or 'high_fever' in danger):
        reasons.append('teething_red_flag')
    if emergency_hint:
        reasons.append('chat_red_flag')
    emergency = bool(reasons)

    confidence_pct = round(float(confidence) * 100, 1)
    low = confidence_pct < LOW_CONFIDENCE
    return {
        'language': lang,
        'condition': text['name'],
        'condition_key': condition,
        'confidence': confidence_pct,
        'low_confidence': low,
        'confidence_note': LOW_CONFIDENCE_NOTE[lang] if low else None,
        'top': [
            {'condition': KB[c][lang]['name'], 'condition_key': c, 'confidence': round(float(p) * 100, 1)}
            for c, p in ranked
        ],
        'causes_types': text['causes_types'],
        'symptoms': text['symptoms'],
        'treatment': None if emergency else {
            'homeopathic': text['treatment_homeopathic'],
            'organic': text['treatment_organic'],
        },
        # Teething: FDA warning hamesha dikhe (emergency mein bhi)
        'homeopathic_warning': text['treatment_homeopathic'] if entry.get('warning') else None,
        'advice': text['emergency_advice'],
        'disclaimer': DISCLAIMER[lang],
        'sources': entry.get('sources', []),
        'emergency': emergency,
        'emergency_message': EMERGENCY_MESSAGE[lang] if emergency else None,
        'emergency_reasons': [REASONS[r][lang] for r in reasons],
        'input': {
            'age_months': age_months,
            'duration_days': duration_days,
            'cards': [c for c in CARDS if c in present],
            'cards_from_notes': [c for c in CARDS if c in from_notes],
            'unknown_symptoms': unknown,
        },
    }, None
