export const EXTENDED_POSES_2 = {
    // ==================== KIDS FUN POSES ====================
    lion_pose: {
        name: 'Lion Pose',
        sanskrit: 'Simhasana',
        category: 'seated',
        level: 'beginner',
        duration: { min: 10, max: 30 },
        audiences: ['kids', 'beginners'],
        focusAreas: ['stress-relief', 'energy'],
        bodyParts: ['face', 'throat', 'chest'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['cat_cow'] },
        narrationHints: {
            kids: 'Sit on your heels! Stick out your tongue, open your eyes wide, and ROAR like a mighty lion!!'
        }
    },
    frog_pose_kids: {
        name: 'Frog Pose (Squat)',
        sanskrit: 'Malasana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['kids', 'beginners', 'teens'],
        focusAreas: ['flexibility', 'digestion'],
        bodyParts: ['hips', 'ankles', 'feet'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['standing_forward_fold'], goodAfter: ['butterfly_pose'] },
        narrationHints: {
            kids: 'Squat down low like a frog on a lily pad! Ribbit, ribbit! Can you hop?'
        }
    },
    airplane_pose: {
        name: 'Airplane Pose',
        sanskrit: 'Dekasana',
        category: 'balancing',
        level: 'beginner',
        duration: { min: 15, max: 30 },
        audiences: ['kids', 'beginners'],
        focusAreas: ['balance', 'core'],
        bodyParts: ['legs', 'arms', 'back'],
        contraindications: ['balance disorders'],
        transitions: { goodBefore: ['warrior_3'], goodAfter: ['mountain_pose'] },
        narrationHints: {
            kids: 'Spread your arms like airplane wings and fly through the sky! Whoooosh!'
        }
    },

    // ==================== MORE WARMUP & STRETCHES ====================
    seated_side_bend: {
        name: 'Seated Side Bend',
        sanskrit: 'Parsva Sukhasana',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 20, max: 45 },
        audiences: ['adults', 'beginners', 'kids', 'seniors', 'office-workers'],
        focusAreas: ['flexibility', 'stress-relief'],
        bodyParts: ['obliques', 'ribs', 'shoulders'],
        contraindications: [],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['cat_cow'] },
        narrationHints: {
            beginner: 'Place one hand on the floor and reach the other arm overhead. Breathe into your side ribs.'
        }
    },
    cow_face_arms: {
        name: 'Cow Face Arms',
        sanskrit: 'Gomukhasana Arms',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'seniors', 'office-workers'],
        focusAreas: ['flexibility', 'posture'],
        bodyParts: ['shoulders', 'triceps', 'chest'],
        contraindications: ['shoulder injury'],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['seated_side_bend'] },
        narrationHints: {
            beginner: 'Reach one arm up and drop the hand behind your neck. Reach the other arm under to clasp hands or grab your shirt.'
        }
    },
    ankle_rotations: {
        name: 'Ankle Rotations',
        sanskrit: 'Goolf Chakra',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'seniors', 'kids', 'athletes'],
        focusAreas: ['flexibility'],
        bodyParts: ['ankles', 'feet'],
        contraindications: [],
        transitions: { goodBefore: ['staff_pose'], goodAfter: ['easy_pose'] },
        narrationHints: {
            relaxation: 'Slowly circle your ankles, tracing big circles in the air with your toes.'
        }
    },

    // ==================== MORE SEATED & TWISTS ====================
    half_lord_of_the_fishes: {
        name: 'Half Lord of the Fishes',
        sanskrit: 'Ardha Matsyendrasana',
        category: 'twist',
        level: 'intermediate',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'intermediate'],
        focusAreas: ['digestion', 'flexibility', 'back-pain'],
        bodyParts: ['spine', 'hips', 'neck'],
        contraindications: ['severe back injury'],
        transitions: { goodBefore: ['staff_pose'], goodAfter: ['seated_forward_fold'] },
        narrationHints: {
            beginner: 'Cross one leg over the other, hug your knee, and sit tall as you twist.'
        }
    },
    fire_log_pose: {
        name: 'Fire Log Pose',
        sanskrit: 'Agnistambhasana',
        category: 'hip_opener',
        level: 'intermediate',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'intermediate', 'athletes'],
        focusAreas: ['flexibility', 'stress-relief'],
        bodyParts: ['hips', 'glutes'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['easy_pose'], goodAfter: ['half_lord_of_the_fishes'] },
        narrationHints: {
            relaxation: 'Stack your shins like fire logs. If your knee is high, support it with a block and breathe into the hips.'
        }
    },
    heros_pose: {
        name: 'Hero Pose',
        sanskrit: 'Virasana',
        category: 'seated',
        level: 'intermediate',
        duration: { min: 30, max: 120 },
        audiences: ['adults', 'intermediate'],
        focusAreas: ['flexibility', 'posture'],
        bodyParts: ['knees', 'ankles', 'thighs'],
        contraindications: ['knee injury', 'ankle injury'],
        transitions: { goodBefore: ['cat_cow'], goodAfter: ['childs_pose'] },
        narrationHints: {
            beginner: 'Kneel and sit your hips between your heels. Use a block under your hips if needed.'
        }
    },

    // ==================== ABDOMINAL & CORE ====================
    half_boat_pose: {
        name: 'Half Boat Pose',
        sanskrit: 'Ardha Navasana',
        category: 'floor',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['core', 'strength'],
        bodyParts: ['core', 'lower-back'],
        contraindications: ['back injury', 'pregnancy'],
        transitions: { goodBefore: ['boat_pose'], goodAfter: ['savasana'] },
        narrationHints: {
            energetic: 'Lower halfway down from Boat pose. Hollow out your belly and hover off the mat!'
        }
    },
    bicycle_crunches: {
        name: 'Yogic Bicycles',
        sanskrit: 'Supta Udarakarshanasana Vinyasa',
        category: 'floor',
        level: 'intermediate',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'athletes'],
        focusAreas: ['core', 'energy'],
        bodyParts: ['obliques', 'core'],
        contraindications: ['neck injury', 'pregnancy'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['happy_baby'] },
        narrationHints: {
            energetic: 'Twist shoulder to opposite knee. Keep elbows wide and move with control.'
        }
    },

    // ==================== STANDING DYNAMIC ====================
    goddess_pose: {
        name: 'Goddess Pose',
        sanskrit: 'Utkata Konasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 30, max: 60 },
        audiences: ['adults', 'pregnant', 'athletes', 'beginners'],
        focusAreas: ['strength', 'energy', 'flexibility'],
        bodyParts: ['quads', 'inner-thighs', 'core'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['mountain_pose'], goodAfter: ['triangle_pose'] },
        narrationHints: {
            energetic: 'Toes out, heels in. Sink your hips low and find that internal fire!',
            poetic: 'Embrace the powerful energy of the Goddess, finding stillness inside the heat.'
        }
    },
    skandasana: {
        name: 'Side Lunge (Skandasana)',
        sanskrit: 'Skandasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['flexibility', 'strength', 'balance'],
        bodyParts: ['hamstrings', 'hips', 'ankles'],
        contraindications: ['knee injury', 'ankle injury'],
        transitions: { goodBefore: ['wide_legged_forward_fold'], goodAfter: ['low_lunge'] },
        narrationHints: {
            energetic: 'Bend deep into one knee while keeping the other leg straight and foot flexed.'
        }
    },
    
    // ==================== ADVANCED INVERSIONS & BALANCES ====================
    headstand: {
        name: 'Supported Headstand',
        sanskrit: 'Salamba Sirsasana',
        category: 'inversion',
        level: 'advanced',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'advanced', 'athletes'],
        focusAreas: ['balance', 'core', 'energy', 'strength'],
        bodyParts: ['shoulders', 'core', 'neck'],
        contraindications: ['neck injury', 'high blood pressure', 'glaucoma'],
        transitions: { goodBefore: ['dolphin_pose'], goodAfter: ['childs_pose'] },
        narrationHints: {
            energetic: 'Interlace fingers, cradle the head, press the forearms down vehemently, and float the legs up.'
        }
    },
    handstand: {
        name: 'Handstand',
        sanskrit: 'Adho Mukha Vrksasana',
        category: 'inversion',
        level: 'advanced',
        duration: { min: 10, max: 60 },
        audiences: ['adults', 'advanced', 'athletes'],
        focusAreas: ['balance', 'strength', 'energy'],
        bodyParts: ['arms', 'shoulders', 'core'],
        contraindications: ['wrist injury', 'shoulder injury', 'high blood pressure'],
        transitions: { goodBefore: ['standing_forward_fold'], goodAfter: ['childs_pose'] },
        narrationHints: {
            poetic: 'Stack your joints in beautiful alignment, finding weightlessness while balancing the earth on your palms.'
        }
    },
    peacock_pose: {
        name: 'Peacock Pose',
        sanskrit: 'Mayurasana',
        category: 'balancing',
        level: 'advanced',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'advanced'],
        focusAreas: ['strength', 'digestion', 'core'],
        bodyParts: ['wrists', 'arms', 'core'],
        contraindications: ['wrist injury', 'pregnancy', 'ulcers'],
        transitions: { goodBefore: ['plank_pose'], goodAfter: ['childs_pose'] },
        narrationHints: {
            energetic: 'Turn your fingertips to face your toes, dig your elbows into your navel, and balance your entire body horizontal to the floor!'
        }
    }
};
