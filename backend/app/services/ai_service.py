import re
import math
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.entities import ProblemPriority, ProblemCategory

# Category keyword dictionaries for classification
CATEGORY_KEYWORDS = {
    ProblemCategory.ROADS_POTHOLES: [
        "pothole", "crater", "asphalt", "road", "tar", "pavement", "caved in", "street bump", "divider", "damaged road", "manhole open"
    ],
    ProblemCategory.WATER_DRAINAGE: [
        "water leak", "pipeline", "drainage", "sewage", "overflow", "stagnant water", "contamination", "clogged drain", "gutter", "water supply", "pipe burst"
    ],
    ProblemCategory.WASTE_MANAGEMENT: [
        "garbage", "trash", "waste", "dump", "debris", "litter", "rubbish", "refuse", "compost", "uncollected bins", "filth", "dumpyard"
    ],
    ProblemCategory.ELECTRICITY_STREETLIGHTS: [
        "streetlight", "light", "dark", "wire", "sparking", "transformer", "pole", "blackout", "live wire", "hanging cables", "power cut", "junction box"
    ],
    ProblemCategory.PUBLIC_SAFETY: [
        "hazard", "open drain", "unfenced", "unsafe", "collapse", "danger", "encroachment", "broken railing", "stray dogs", "accident zone", "missing cover"
    ],
    ProblemCategory.PUBLIC_TRANSPORT: [
        "bus stop", "bus shelter", "traffic signal", "signboard", "zebra crossing", "metro pillar", "auto stand", "speed breaker", "broken barrier"
    ],
    ProblemCategory.ENVIRONMENT: [
        "tree fallen", "branch", "pollution", "smoke", "illegal burning", "noise", "lake froth", "green belt", "deforestation", "chemical odor"
    ],
    ProblemCategory.HEALTHCARE: [
        "hospital", "clinic", "dispensary", "mosquito breeding", "dengue", "medical waste", "health center", "ambulance access"
    ],
    ProblemCategory.EDUCATION: [
        "school", "college", "playground", "boundary wall", "school bus", "classroom", "institution"
    ]
}

# High urgency & safety hazard trigger words
CRITICAL_FACTORS = [
    ("live wire", 35, "Electrocution / Live wire hazard detected"),
    ("sparking", 25, "Electrical fire risk"),
    ("caved in", 30, "Structural collapse / road cave-in danger"),
    ("open manhole", 35, "Pedestrian / vehicle fall hazard"),
    ("pipe burst", 25, "Major water flooding and wastage"),
    ("overflowing sewage", 20, "Public health and epidemic hazard"),
    ("deep pothole", 20, "High accident risk for two-wheelers"),
    ("blind spot", 15, "Traffic collision hazard"),
    ("gas smell", 35, "Flammable gas / chemical inhalation hazard"),
    ("school zone", 15, "Children / vulnerable pedestrians present"),
    ("hospital road", 20, "Critical emergency route obstruction"),
    ("fire", 35, "Immediate fire emergency hazard")
]

class AIService:
    @staticmethod
    def classify_category(title: str, description: str) -> Tuple[str, float]:
        """
        Classifies problem category based on NLP keyword density & matching.
        Returns (suggested_category, confidence_score)
        """
        text = f"{title} {description}".lower()
        scores = {}
        
        for category, keywords in CATEGORY_KEYWORDS.items():
            match_count = 0
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    match_count += 2
                elif kw in text:
                    match_count += 1
            if match_count > 0:
                scores[category.value] = match_count

        if not scores:
            return ProblemCategory.OTHER.value, 0.60

        best_category = max(scores, key=scores.get)
        raw_score = scores[best_category]
        confidence = min(0.96, 0.65 + (raw_score * 0.05))
        return best_category, round(confidence, 2)

    @staticmethod
    def calculate_priority(
        title: str,
        description: str,
        urgency_level: str,
        safety_hazard: bool
    ) -> Tuple[float, ProblemPriority, str, List[str]]:
        """
        Calculates multi-factor priority score (0 - 100), maps to PriorityEnum,
        and provides transparent factor breakdown.
        """
        text = f"{title} {description}".lower()
        factors_found = []
        base_score = 30.0 # Standard base

        # 1. User specified urgency
        urgency_lower = (urgency_level or "").lower()
        if urgency_lower == "critical":
            base_score += 25
            factors_found.append("Citizen flagged as Critical urgency (+25)")
        elif urgency_lower == "high":
            base_score += 15
            factors_found.append("Citizen flagged as High urgency (+15)")
        elif urgency_lower == "medium":
            base_score += 5
        
        # 2. Safety hazard flag
        if safety_hazard:
            base_score += 20
            factors_found.append("Direct safety hazard identified (+20)")

        # 3. NLP Safety & Risk triggers
        nlp_points = 0
        for trigger, pts, reason in CRITICAL_FACTORS:
            if trigger in text:
                nlp_points += pts
                factors_found.append(f"{reason} (+{pts})")

        total_score = min(100.0, base_score + nlp_points)

        # Map to Priority Enum
        if total_score >= 80:
            priority = ProblemPriority.CRITICAL
        elif total_score >= 60:
            priority = ProblemPriority.HIGH
        elif total_score >= 40:
            priority = ProblemPriority.MEDIUM
        else:
            priority = ProblemPriority.LOW

        explanation = f"AI Priority Score: {total_score:.1f}/100. Key factors: " + (
            "; ".join(factors_found) if factors_found else "Standard civic issue evaluation without severe hazard triggers."
        )

        return round(total_score, 1), priority, explanation, factors_found

    @staticmethod
    def find_duplicates(
        new_title: str,
        new_description: str,
        new_lat: Optional[float],
        new_lng: Optional[float],
        existing_problems: List[Dict[str, Any]],
        similarity_threshold: float = 0.40,
        max_distance_km: float = 1.0
    ) -> List[Dict[str, Any]]:
        """
        Uses scikit-learn TF-IDF and cosine similarity + geographic proximity (Haversine)
        to identify candidate duplicates.
        """
        if not existing_problems:
            return []

        target_text = f"{new_title} {new_description}".strip().lower()
        corpus = [f"{p['title']} {p['description']}".strip().lower() for p in existing_problems]
        corpus.insert(0, target_text)

        try:
            vectorizer = TfidfVectorizer(stop_words='english', min_df=1, ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform(corpus)
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        except Exception:
            # Fallback simple word overlap
            target_words = set(target_text.split())
            cosine_sim = []
            for item in existing_problems:
                item_words = set(f"{item['title']} {item['description']}".lower().split())
                overlap = len(target_words & item_words) / max(1, len(target_words | item_words))
                cosine_sim.append(overlap)

        matches = []
        for idx, score in enumerate(cosine_sim):
            prob = existing_problems[idx]
            dist_meters = None

            # Check geographic proximity if coordinates exist
            if new_lat and new_lng and prob.get('latitude') and prob.get('longitude'):
                dist_meters = AIService._haversine(
                    new_lat, new_lng, prob['latitude'], prob['longitude']
                )

            # Qualification: either high text similarity or moderate similarity + very close distance
            is_match = False
            if score >= similarity_threshold:
                is_match = True
            elif score >= 0.25 and dist_meters is not None and dist_meters <= 500:
                is_match = True

            if is_match:
                matches.append({
                    "id": prob["id"],
                    "report_id": prob.get("report_id", f"CS-{prob['id']}"),
                    "title": prob["title"],
                    "description": prob["description"][:120] + "...",
                    "similarity_score": round(float(score), 3),
                    "distance_meters": round(dist_meters, 1) if dist_meters is not None else None,
                    "status": prob.get("status", "REPORTED")
                })

        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matches[:5] # Top 5 candidate duplicates

    @staticmethod
    def recommend_department(category: str, locality: Optional[str] = None) -> str:
        """
        Rules engine mapping issue category and locality to standard municipal department.
        """
        cat_lower = (category or "").lower()
        if "road" in cat_lower or "pothole" in cat_lower:
            return "Department of Public Works & Roads (DPW)"
        elif "water" in cat_lower or "drainage" in cat_lower or "sewage" in cat_lower:
            return "Municipal Water Supply & Sewerage Board (MWSSB)"
        elif "waste" in cat_lower or "garbage" in cat_lower:
            return "Solid Waste Management Authority (SWMA)"
        elif "electricity" in cat_lower or "streetlight" in cat_lower:
            return "Electricity Supply & Streetlight Division"
        elif "safety" in cat_lower:
            return "Civil Safety & Disaster Response Cell"
        elif "transport" in cat_lower:
            return "Urban Traffic & Transit Management"
        elif "environment" in cat_lower:
            return "Urban Forestry & Environmental Protection"
        elif "healthcare" in cat_lower:
            return "Public Health Services Department"
        elif "education" in cat_lower:
            return "Department of Public Education"
        return "Central Citizen Grievance Redressal Cell"

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance between two points in meters"""
        R = 6371000 # Radius of earth in meters
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) * math.sin(dlon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

