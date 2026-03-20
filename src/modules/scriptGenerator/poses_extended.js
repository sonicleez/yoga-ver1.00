export const EXTENDED_POSES = {
    // ==================== YIN & RESTORATIVE ====================
    supported_fish_pose: {
        name: 'Supported Fish Pose',
        sanskrit: 'Matsyasana',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 180, max: 300 },
        audiences: ['adults', 'seniors', 'beginners', 'pregnant', 'office-workers'],
        focusAreas: ['relaxation', 'stress-relief', 'posture', 'breathing'],
        bodyParts: ['chest', 'shoulders', 'spine'],
        contraindications: ['severe neck injury'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['butterfly_pose'] },
        narrationHints: {
            beginner: 'Place a block under your upper back and relax completely.',
            relaxation: 'Let your heart center open. Surrender your weight to the props.',
            poetic: 'Imagine a warm light filling your chest as your heart gently blooms open.'
        }
    },
    legs_up_the_wall: {
        name: 'Legs Up The Wall',
        sanskrit: 'Viparita Karani',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 180, max: 600 },
        audiences: ['adults', 'seniors', 'pregnant', 'athletes', 'beginners'],
        focusAreas: ['relaxation', 'sleep', 'stress-relief', 'energy'],
        bodyParts: ['legs', 'lower-back', 'hips'],
        contraindications: ['glaucoma', 'high blood pressure'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['bridge_pose'] },
        narrationHints: {
            beginner: 'Scoot your hips to the wall and extend your legs straight up.',
            relaxation: 'Feel the draining of fatigue from your legs. A deeply cooling and restorative posture.',
            poetic: 'Let gravity reverse the flow, washing peace through your tired muscles.'
        }
    },
    reclined_butterfly: {
        name: 'Reclined Butterfly',
        sanskrit: 'Supta Baddha Konasana',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 120, max: 300 },
        audiences: ['adults', 'pregnant', 'beginners', 'seniors'],
        focusAreas: ['relaxation', 'flexibility'],
        bodyParts: ['hips', 'groin', 'chest'],
        contraindications: ['groin injury'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['bridge_pose'] },
        narrationHints: {
            beginner: 'Lie on your back, bring soles of your feet together and let knees fall open.',
            relaxation: 'Breathe into your belly and let your hips soften like a heavy blanket.',
        }
    },
    sphinx_pose: {
        name: 'Sphinx Pose',
        sanskrit: 'Salamba Bhujangasana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 60, max: 180 },
        audiences: ['adults', 'beginners', 'office-workers'],
        focusAreas: ['back-pain', 'posture'],
        bodyParts: ['lower-back', 'chest', 'spine'],
        contraindications: ['pregnancy', 'severe back injury'],
        transitions: { goodBefore: ['locust_pose'], goodAfter: ['childs_pose'] },
        narrationHints: {
            beginner: 'Lie on your stomach and prop yourself up on your elbows.',
            relaxation: 'Gently compress the lower back while drawing the chest forward.',
        }
    },
    puppy_pose: {
        name: 'Puppy Pose',
        sanskrit: 'Uttana Shishosana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 60, max: 120 },
        audiences: ['adults', 'beginners', 'teens', 'kids'],
        focusAreas: ['flexibility', 'stress-relief'],
        bodyParts: ['shoulders', 'upper-back', 'spine'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['downward_facing_dog', 'childs_pose'], goodAfter: ['cat_cow'] },
        narrationHints: {
            beginner: 'Keep your hips high above your knees and walk your hands forward until your forehead touches the mat.',
            kids: 'Stretch your paws out like a sleepy puppy stretching!',
        }
    },

    // ==================== CORE & ARM BALANCES ====================
    crow_pose: {
        name: 'Crow Pose',
        sanskrit: 'Bakasana',
        category: 'inversion',
        level: 'advanced',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'athletes', 'advanced'],
        focusAreas: ['strong', 'balance', 'core'],
        bodyParts: ['wrists', 'arms', 'core'],
        contraindications: ['carpal tunnel', 'pregnancy'],
        transitions: { goodBefore: ['chaturanga', 'plank_pose'], goodAfter: ['malasana'] },
        narrationHints: {
            energetic: 'Plant your hands, gaze forward, and take flight. Squeeze your core tight!',
            poetic: 'Find the delicate balance point where effort turns into levitation.'
        }
    },
    side_plank: {
        name: 'Side Plank',
        sanskrit: 'Vasisthasana',
        category: 'floor',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['strength', 'balance', 'core'],
        bodyParts: ['arms', 'obliques', 'shoulders'],
        contraindications: ['shoulder injury', 'wrist injury'],
        transitions: { goodBefore: ['wild_thing'], goodAfter: ['plank_pose', 'downward_facing_dog'] },
        narrationHints: {
            energetic: 'Lift your hips high to the sky. Draw in your obliques. You are strong.',
        }
    },
    wild_thing: {
        name: 'Wild Thing',
        sanskrit: 'Camatkarasana',
        category: 'backbend',
        level: 'intermediate',
        duration: { min: 15, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['energy', 'flexibility'],
        bodyParts: ['chest', 'hips', 'arms'],
        contraindications: ['shoulder injury'],
        transitions: { goodBefore: ['downward_facing_dog'], goodAfter: ['side_plank', 'three_legged_dog'] },
        narrationHints: {
            energetic: 'Flip your dog! Open your heart wildly towards the ceiling!',
            poetic: 'Step behind, lift your hips, and unfold into a beautiful ecstatic arch.'
        }
    },
    dolphin_pose: {
        name: 'Dolphin Pose',
        sanskrit: 'Ardha Pincha Mayurasana',
        category: 'inversion',
        level: 'intermediate',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['strength', 'flexibility'],
        bodyParts: ['shoulders', 'arms', 'hamstrings'],
        contraindications: ['shoulder injury'],
        transitions: { goodBefore: ['forearm_stand', 'childs_pose'], goodAfter: ['downward_facing_dog'] },
        narrationHints: {
            beginner: 'Like downward dog but on your forearms. Walk your toes closer.',
            energetic: 'Press firmly into your forearms to fire up your shoulders.'
        }
    },
    forearm_plank: {
        name: 'Forearm Plank',
        sanskrit: 'Makara Adho Mukha Svanasana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'athletes', 'beginners'],
        focusAreas: ['core', 'strength'],
        bodyParts: ['core', 'shoulders', 'glutes'],
        contraindications: ['shoulder injury'],
        transitions: { goodBefore: ['dolphin_pose', 'sphinx_pose'], goodAfter: ['plank_pose'] },
        narrationHints: {
            energetic: 'Zip up your lower belly. Create a strong line of energy from crown to heels.',
        }
    },

    // ==================== ADVANCED HIP & LEG BINDINGS ====================
    bird_of_paradise: {
        name: 'Bird of Paradise',
        sanskrit: 'Svarga Dvijasana',
        category: 'balancing',
        level: 'advanced',
        duration: { min: 15, max: 30 },
        audiences: ['adults', 'athletes', 'advanced'],
        focusAreas: ['balance', 'flexibility', 'strength'],
        bodyParts: ['hips', 'hamstrings', 'shoulders', 'legs'],
        contraindications: ['shoulder injury', 'hip injury'],
        transitions: { goodBefore: ['mountain_pose'], goodAfter: ['extended_side_angle'] },
        narrationHints: {
            energetic: 'Keep your bind, shift your weight, and slowly stand up tall. Then extend the leg!',
        }
    },
    king_pigeon: {
        name: 'King Pigeon',
        sanskrit: 'Eka Pada Rajakapotasana',
        category: 'hip_opener',
        level: 'advanced',
        duration: { min: 20, max: 45 },
        audiences: ['adults', 'advanced'],
        focusAreas: ['flexibility', 'back-pain'],
        bodyParts: ['hips', 'spine', 'chest'],
        contraindications: ['knee injury', 'lower back injury'],
        transitions: { goodBefore: ['downward_facing_dog'], goodAfter: ['pigeon_pose'] },
        narrationHints: {
            poetic: 'Reach back for your foot, puff your chest like a proud pigeon, exploring the deepest edge of your hip and spine.'
        }
    },
    splits: {
        name: 'Monkey Pose (Splits)',
        sanskrit: 'Hanumanasana',
        category: 'hip_opener',
        level: 'advanced',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'athletes', 'advanced'],
        focusAreas: ['flexibility'],
        bodyParts: ['hamstrings', 'hip-flexors'],
        contraindications: ['groin injury', 'hamstring injury'],
        transitions: { goodBefore: ['low_lunge'], goodAfter: ['half_splits'] },
        narrationHints: {
            energetic: 'Breathe into the sensation. Slide your front heel forward to your capacity.',
        }
    },
    half_splits: {
        name: 'Half Splits',
        sanskrit: 'Ardha Hanumanasana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'beginners', 'athletes'],
        focusAreas: ['flexibility'],
        bodyParts: ['hamstrings', 'calves'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['splits'], goodAfter: ['low_lunge'] },
        narrationHints: {
            beginner: 'Straighten your front leg, flex your foot, and hinge at your hips over your front leg.'
        }
    },
    cow_face_pose: {
        name: 'Cow Face Pose',
        sanskrit: 'Gomukhasana',
        category: 'seated',
        level: 'intermediate',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'intermediate', 'office-workers'],
        focusAreas: ['flexibility', 'posture'],
        bodyParts: ['hips', 'shoulders', 'triceps'],
        contraindications: ['shoulder injury', 'knee injury'],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['seated_forward_fold'] },
        narrationHints: {
            beginner: 'Stack your knees on top of each other. Reach one arm high and the other low to clasp behind your back.'
        }
    },

    // ==================== MORE STANDING & TWISTS ====================
    revolved_triangle: {
        name: 'Revolved Triangle',
        sanskrit: 'Parivrtta Trikonasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'intermediate', 'athletes'],
        focusAreas: ['balance', 'digestion', 'flexibility'],
        bodyParts: ['hamstrings', 'spine', 'core'],
        contraindications: ['back injury', 'low blood pressure'],
        transitions: { goodBefore: ['pyramid_pose'], goodAfter: ['triangle_pose'] },
        narrationHints: {
            energetic: 'Twist from your core, revolving your chest toward the sky while anchoring both heels.'
        }
    },
    revolved_chair: {
        name: 'Revolved Chair',
        sanskrit: 'Parivrtta Utkatasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'intermediate', 'athletes'],
        focusAreas: ['strength', 'digestion', 'twists'],
        bodyParts: ['legs', 'core', 'spine'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['standing_forward_fold'], goodAfter: ['chair_pose'] },
        narrationHints: {
            energetic: 'Hook your elbow outside your knee. Press your palms together to deepen the twist.'
        }
    },
    pyramid_pose: {
        name: 'Pyramid Pose',
        sanskrit: 'Parsvottanasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'beginners', 'athletes'],
        focusAreas: ['flexibility', 'balance'],
        bodyParts: ['hamstrings', 'spine'],
        contraindications: ['hamstring injury'],
        transitions: { goodBefore: ['revolved_triangle'], goodAfter: ['warrior_1', 'standing_forward_fold'] },
        narrationHints: {
            beginner: 'Both legs straight, toes pointing mostly forward. Fold over your front leg with a flat back.'
        }
    },
    eagle_arms: {
        name: 'Eagle Arms (Seated or Standing)',
        sanskrit: 'Garudasana Arms',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'seniors', 'beginners', 'office-workers'],
        focusAreas: ['flexibility', 'stress-relief'],
        bodyParts: ['upper-back', 'shoulders', 'neck'],
        contraindications: ['shoulder injury'],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['shoulder_rolls'] },
        narrationHints: {
            beginner: 'Wrap your right arm under your left. Lift your elbows and press hands away from your face.'
        }
    },
    reclined_twist: {
        name: 'Reclined Spinal Twist',
        sanskrit: 'Supta Matsyendrasana',
        category: 'supine',
        level: 'beginner',
        duration: { min: 60, max: 120 },
        audiences: ['adults', 'kids', 'beginners', 'seniors'],
        focusAreas: ['relaxation', 'digestion', 'back-pain'],
        bodyParts: ['spine', 'lower-back', 'chest'],
        contraindications: ['severe back injury'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['happy_baby'] },
        narrationHints: {
            relaxation: 'Draw your knees to your chest and let them fall to the side. Look over your opposite shoulder.',
            poetic: 'Wring out any remaining tension like a wet sponge, preparing your body for deep rest.'
        }
    }
};
