export const EXTENDED_POSES_3 = {
    // ==================== SUN SALUTATION & VINYASA CORE ====================
    chaturanga: {
        name: 'Chaturanga Dandasana (Low Plank)',
        sanskrit: 'Chaturanga Dandasana',
        category: 'floor',
        level: 'intermediate',
        duration: { min: 5, max: 15 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['strength', 'core'],
        bodyParts: ['triceps', 'chest', 'core'],
        contraindications: ['shoulder injury', 'wrist injury'],
        transitions: { goodBefore: ['upward_facing_dog', 'cobra_pose'], goodAfter: ['plank_pose'] },
        narrationHints: {
            energetic: 'Shift forward on your toes, exhale, and lower halfway down. Keep elbows hugged tight to your ribs!'
        }
    },
    knees_chest_chin: {
        name: 'Knees, Chest, Chin',
        sanskrit: 'Ashtanga Namaskara',
        category: 'floor',
        level: 'beginner',
        duration: { min: 5, max: 15 },
        audiences: ['adults', 'beginners'],
        focusAreas: ['flexibility', 'strength'],
        bodyParts: ['chest', 'spine'],
        contraindications: ['neck injury', 'wrist injury'],
        transitions: { goodBefore: ['cobra_pose'], goodAfter: ['plank_pose'] },
        narrationHints: {
            beginner: 'Drop your knees, lower your chest and chin to the mat, keeping your hips high.'
        }
    },
    standing_backbend: {
        name: 'Standing Backbend',
        sanskrit: 'Anuvittasana',
        category: 'backbend',
        level: 'beginner',
        duration: { min: 10, max: 20 },
        audiences: ['adults', 'beginners', 'teens', 'kids'],
        focusAreas: ['posture', 'energy'],
        bodyParts: ['chest', 'spine', 'shoulders'],
        contraindications: ['severe back injury'],
        transitions: { goodBefore: ['standing_forward_fold'], goodAfter: ['mountain_pose'] },
        narrationHints: {
            energetic: 'Inhale, sweep your arms up, lift your heart, and find a gentle backbend. Open the front line of your body!'
        }
    },

    // ==================== LUNGE VARIATIONS ====================
    crescent_lunge_twist: {
        name: 'Revolved Crescent Lunge',
        sanskrit: 'Parivrtta Anjaneyasana',
        category: 'twist',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['balance', 'strength', 'digestion'],
        bodyParts: ['thighs', 'spine', 'core'],
        contraindications: ['knee injury', 'balance disorders'],
        transitions: { goodBefore: ['lizard_pose', 'standing_forward_fold'], goodAfter: ['high_lunge'] },
        narrationHints: {
            energetic: 'Bring palms to heart center, twist from the navel, and hook the elbow outside the front thigh.'
        }
    },
    humble_warrior: {
        name: 'Humble Warrior',
        sanskrit: 'Baddha Virabhadrasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'intermediate'],
        focusAreas: ['strength', 'flexibility'],
        bodyParts: ['shoulders', 'hips', 'legs'],
        contraindications: ['knee injury', 'low blood pressure'],
        transitions: { goodBefore: ['lizard_pose', 'pyramid_pose'], goodAfter: ['warrior_1'] },
        narrationHints: {
            poetic: 'Interlace your fingers behind your back and bow forward inside your front knee. Surrender to your own strength.'
        }
    },

    // ==================== SEATED STRETCHES ====================
    wide_angle_seated_forward_bend: {
        name: 'Wide-Angle Seated Forward Bend',
        sanskrit: 'Upavistha Konasana',
        category: 'seated',
        level: 'beginner',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'beginners', 'teens'],
        focusAreas: ['flexibility', 'relaxation'],
        bodyParts: ['inner-thighs', 'hamstrings', 'spine'],
        contraindications: ['lower back injury'],
        transitions: { goodBefore: ['butterfly_pose'], goodAfter: ['staff_pose'] },
        narrationHints: {
            beginner: 'Open your legs wide in a V shape. Sit tall, then walk your hands forward gently.'
        }
    },
    compass_pose: {
        name: 'Compass Pose',
        sanskrit: 'Parivrtta Surya Yantrasana',
        category: 'seated',
        level: 'advanced',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'athletes', 'advanced'],
        focusAreas: ['flexibility', 'balance'],
        bodyParts: ['hamstrings', 'shoulders', 'side-body'],
        contraindications: ['shoulder injury', 'hamstring injury'],
        transitions: { goodBefore: ['seated_side_bend'], goodAfter: ['half_lord_of_the_fishes'] },
        narrationHints: {
            poetic: 'Thread the arm under the lifted leg, reaching the other arm up and over to grasp the foot, opening completely to the side like a compass seeking North.'
        }
    },

    // ==================== DEEP RELAXATION & SUPINE ====================
    supine_spinal_twist_eagle_legs: {
        name: 'Eagle Legs Spinal Twist',
        sanskrit: 'Supta Matsyendrasana Garuda Legs',
        category: 'supine',
        level: 'intermediate',
        duration: { min: 45, max: 120 },
        audiences: ['adults', 'intermediate', 'athletes'],
        focusAreas: ['flexibility', 'relaxation', 'back-pain'],
        bodyParts: ['spine', 'hips', 'lower-back'],
        contraindications: ['severe back injury'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['reclined_twist'] },
        narrationHints: {
            relaxation: 'Wrap one leg over the other like Eagle pose, then drop both knees to the side for a deeply wringing twist.'
        }
    },
    supine_pigeon: {
        name: 'Reclined Figure Four (Supine Pigeon)',
        sanskrit: 'Supta Kapotasana',
        category: 'supine',
        level: 'beginner',
        duration: { min: 45, max: 120 },
        audiences: ['adults', 'beginners', 'pregnant', 'seniors'],
        focusAreas: ['relaxation', 'back-pain', 'hip-opener'],
        bodyParts: ['glutes', 'hips', 'lower-back'],
        contraindications: ['knee injury'],
        transitions: { goodBefore: ['savasana', 'happy_baby'], goodAfter: ['bridge_pose'] },
        narrationHints: {
            beginner: 'Cross your right ankle over your left knee, making a figure four shape. Gently pull the left thigh toward you.',
            poetic: 'Let the tension melt away from your outer hips, finding the same relief as Pigeon pose but supported safely by the earth.'
        }
    },
    fish_pose: {
        name: 'Fish Pose',
        sanskrit: 'Matsyasana',
        category: 'supine',
        level: 'intermediate',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'athletes'],
        focusAreas: ['flexibility', 'breathing', 'energy'],
        bodyParts: ['throat', 'chest', 'neck'],
        contraindications: ['neck injury', 'migraine'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['bridge_pose'] },
        narrationHints: {
            energetic: 'Prop up on your forearms, lift your chest high, and gently release the crown of your head back toward the mat.'
        }
    },
    plow_pose: {
        name: 'Plow Pose',
        sanskrit: 'Halasana',
        category: 'inversion',
        level: 'advanced',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'advanced'],
        focusAreas: ['flexibility', 'relaxation', 'digestion'],
        bodyParts: ['spine', 'neck', 'hamstrings'],
        contraindications: ['neck injury', 'glaucoma', 'pregnancy'],
        transitions: { goodBefore: ['savasana'], goodAfter: ['shoulder_stand'] },
        narrationHints: {
            relaxation: 'From your back, swing your legs up and over your head, aiming the toes for the floor behind you.'
        }
    },
    shoulder_stand: {
        name: 'Shoulder Stand',
        sanskrit: 'Salamba Sarvangasana',
        category: 'inversion',
        level: 'advanced',
        duration: { min: 30, max: 120 },
        audiences: ['adults', 'advanced'],
        focusAreas: ['sleep', 'energy', 'balance'],
        bodyParts: ['shoulders', 'neck', 'core'],
        contraindications: ['neck injury', 'high blood pressure', 'pregnancy', 'glaucoma'],
        transitions: { goodBefore: ['plow_pose'], goodAfter: ['bridge_pose'] },
        narrationHints: {
            relaxation: 'Support your lower back with your hands as you extend your legs straight up to the sky. Keep your neck perfectly still.'
        }
    }
};
