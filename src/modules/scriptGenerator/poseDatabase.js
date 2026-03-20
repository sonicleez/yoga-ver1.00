/**
 * POSE DATABASE — Comprehensive yoga pose registry
 * 
 * 50+ core poses with rich metadata for filtering, sequencing, and AI generation.
 * Easily expandable to 200+ by adding entries to POSES_DB.
 */

import { EXTENDED_POSES } from './poses_extended.js';
import { EXTENDED_POSES_2 } from './poses_extended_2.js';
import { EXTENDED_POSES_3 } from './poses_extended_3.js';

// ============================================================
// POSE CATEGORIES
// ============================================================

export const POSE_CATEGORIES = {
    warmup:      { name: 'Warm-up',        icon: '🔥', order: 1 },
    standing:    { name: 'Standing',       icon: '🧍', order: 2 },
    balancing:   { name: 'Balancing',      icon: '⚖️', order: 3 },
    seated:      { name: 'Seated',         icon: '🪷', order: 4 },
    floor:       { name: 'Floor / Prone',  icon: '🛏️', order: 5 },
    supine:      { name: 'Supine',         icon: '😴', order: 6 },
    inversion:   { name: 'Inversions',     icon: '🙃', order: 7 },
    twist:       { name: 'Twists',         icon: '🔄', order: 8 },
    backbend:    { name: 'Backbends',      icon: '🌈', order: 9 },
    hip_opener:  { name: 'Hip Openers',    icon: '🦋', order: 10 },
    cooldown:    { name: 'Cool-down',      icon: '❄️', order: 11 },
    restorative: { name: 'Restorative',    icon: '🧘', order: 12 },
    breathing:   { name: 'Breathing',      icon: '💨', order: 13 },
};

export const AUDIENCE_TAGS = [
    'kids', 'teens', 'adults', 'seniors', 'pregnant', 'postpartum',
    'beginners', 'intermediate', 'advanced', 'athletes', 'office-workers',
    'limited-mobility',
];

export const FOCUS_AREAS = [
    'flexibility', 'strength', 'balance', 'relaxation', 'breathing',
    'core', 'back-pain', 'stress-relief', 'energy', 'sleep',
    'digestion', 'posture', 'weight-loss', 'meditation', 'mindfulness',
];

// ============================================================
// POSE DATABASE — 55 Core Poses
// ============================================================

export const POSES_DB = {

    // ==================== WARM-UP & BREATHING ====================

    easy_pose: {
        name: 'Easy Pose',
        sanskrit: 'Sukhasana',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 30, max: 120 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['relaxation', 'breathing', 'meditation', 'posture'],
        bodyParts: ['hips', 'spine', 'shoulders'],
        contraindications: ['severe knee injury'],
        transitions: {
            goodBefore: ['gentle_neck_stretch', 'cat_cow', 'seated_forward_fold', 'butterfly_pose'],
            goodAfter: ['mountain_pose', 'standing_forward_fold'],
        },
        narrationHints: {
            beginner: 'Focus on sitting tall and breathing slowly',
            kids: 'Sit like a pretzel! Can you make your back really tall like a giraffe?',
            relaxation: 'Let your body settle. Feel the ground beneath you.',
            energetic: 'Sit tall and awake! Feel the energy in your spine.',
        },
    },

    gentle_neck_stretch: {
        name: 'Gentle Neck Stretch',
        sanskrit: '',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'office-workers'],
        focusAreas: ['relaxation', 'stress-relief', 'posture'],
        bodyParts: ['neck', 'shoulders'],
        contraindications: ['severe neck injury', 'cervical disc issues'],
        transitions: {
            goodBefore: ['cat_cow', 'mountain_pose', 'shoulder_rolls'],
            goodAfter: ['easy_pose', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Slowly tilt your head to one side, feel the gentle stretch',
            kids: 'Look over your shoulder like an owl! Whooo!',
            relaxation: 'Release the tension from your neck, one side at a time.',
        },
    },

    shoulder_rolls: {
        name: 'Shoulder Rolls',
        sanskrit: '',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'office-workers'],
        focusAreas: ['relaxation', 'stress-relief', 'posture'],
        bodyParts: ['shoulders', 'neck'],
        contraindications: [],
        transitions: {
            goodBefore: ['gentle_neck_stretch', 'mountain_pose'],
            goodAfter: ['easy_pose'],
        },
        narrationHints: {
            beginner: 'Roll your shoulders forward, then backward in big circles',
            kids: 'Make big circles with your shoulders like a windmill!',
        },
    },

    belly_breathing: {
        name: 'Belly Breathing',
        sanskrit: '',
        category: 'breathing',
        level: 'beginner',
        duration: { min: 30, max: 120 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['breathing', 'relaxation', 'stress-relief', 'mindfulness'],
        bodyParts: ['core', 'diaphragm'],
        contraindications: [],
        transitions: {
            goodBefore: ['easy_pose', 'cat_cow'],
            goodAfter: ['mountain_pose', 'easy_pose'],
        },
        narrationHints: {
            beginner: 'Place your hands on your belly. Feel it rise as you breathe in.',
            kids: 'Put your hands on your tummy. Can you make it big like a balloon?',
        },
    },

    // ==================== FLOOR / TABLETOP ====================

    cat_cow: {
        name: 'Cat Cow',
        sanskrit: 'Marjaryasana-Bitilasana',
        category: 'warmup',
        level: 'beginner',
        duration: { min: 30, max: 90 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant', 'office-workers'],
        focusAreas: ['flexibility', 'back-pain', 'breathing', 'core'],
        bodyParts: ['spine', 'core', 'shoulders', 'neck'],
        contraindications: ['severe neck injury'],
        transitions: {
            goodBefore: ['childs_pose', 'downward_facing_dog', 'thread_the_needle'],
            goodAfter: ['easy_pose', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Move slowly between arching and rounding your back',
            kids: "Meow like a cat! Now moo like a cow! Let's keep going!",
            relaxation: 'Flow gently with your breath. Inhale to arch, exhale to round.',
        },
    },

    childs_pose: {
        name: "Child's Pose",
        sanskrit: 'Balasana',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 30, max: 180 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['relaxation', 'back-pain', 'stress-relief', 'breathing'],
        bodyParts: ['spine', 'hips', 'shoulders'],
        contraindications: ['knee injury', 'late pregnancy'],
        transitions: {
            goodBefore: ['cat_cow', 'downward_facing_dog', 'cobra_pose'],
            goodAfter: ['easy_pose', 'cat_cow', 'downward_facing_dog'],
        },
        narrationHints: {
            beginner: 'Lower your hips toward your heels and rest your forehead down',
            kids: 'Curl up tiny like a little seed in the ground!',
            relaxation: 'Surrender into the pose. This is your safe resting place.',
        },
    },

    thread_the_needle: {
        name: 'Thread the Needle',
        sanskrit: 'Parsva Balasana',
        category: 'twist',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'seniors', 'beginners', 'office-workers'],
        focusAreas: ['flexibility', 'back-pain', 'stress-relief'],
        bodyParts: ['spine', 'shoulders', 'upper-back'],
        contraindications: ['shoulder injury'],
        transitions: {
            goodBefore: ['childs_pose', 'cat_cow'],
            goodAfter: ['cat_cow', 'easy_pose'],
        },
        narrationHints: {
            beginner: 'Slide one arm under your body and rest your shoulder on the mat',
            relaxation: 'Let your upper back release with each breath.',
        },
    },

    // ==================== STANDING ====================

    mountain_pose: {
        name: 'Mountain Pose',
        sanskrit: 'Tadasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'athletes'],
        focusAreas: ['posture', 'balance', 'breathing', 'mindfulness'],
        bodyParts: ['full-body', 'legs', 'core'],
        contraindications: [],
        transitions: {
            goodBefore: ['standing_forward_fold', 'warrior_1', 'tree_pose', 'chair_pose'],
            goodAfter: ['easy_pose', 'savasana'],
        },
        narrationHints: {
            beginner: 'Stand tall like a mountain, feet hip-width apart',
            kids: 'Stand as tall as you can! Pretend you are a big strong mountain!',
            energetic: 'Root your feet into the earth. Feel the energy rising through your legs.',
        },
    },

    standing_forward_fold: {
        name: 'Standing Forward Fold',
        sanskrit: 'Uttanasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['kids', 'adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'relaxation', 'stress-relief'],
        bodyParts: ['hamstrings', 'spine', 'calves'],
        contraindications: ['severe back injury'],
        transitions: {
            goodBefore: ['half_lift', 'ragdoll', 'mountain_pose', 'low_lunge'],
            goodAfter: ['mountain_pose', 'easy_pose'],
        },
        narrationHints: {
            beginner: 'Stand tall, then slowly fold forward. Let your head and neck relax.',
            kids: 'Touch your toes! Can you see the world upside down?',
        },
    },

    half_lift: {
        name: 'Half Lift',
        sanskrit: 'Ardha Uttanasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['posture', 'core', 'back-pain'],
        bodyParts: ['spine', 'core', 'hamstrings'],
        contraindications: [],
        transitions: {
            goodBefore: ['standing_forward_fold', 'low_lunge'],
            goodAfter: ['standing_forward_fold', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Lift halfway up with a long, straight back',
            energetic: 'Lengthen your spine and look forward with confidence.',
        },
    },

    chair_pose: {
        name: 'Chair Pose',
        sanskrit: 'Utkatasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'core', 'balance', 'energy'],
        bodyParts: ['legs', 'core', 'arms'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['standing_forward_fold', 'mountain_pose'],
            goodAfter: ['mountain_pose'],
        },
        narrationHints: {
            beginner: 'Bend your knees like sitting in an invisible chair',
            energetic: 'Sit low and strong! Arms up! Feel the fire in your legs!',
            kids: 'Pretend you are sitting on an invisible chair! Hold it steady!',
        },
    },

    ragdoll: {
        name: 'Ragdoll Pose',
        sanskrit: '',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'office-workers'],
        focusAreas: ['relaxation', 'flexibility', 'stress-relief'],
        bodyParts: ['spine', 'hamstrings', 'shoulders'],
        contraindications: ['low blood pressure'],
        transitions: {
            goodBefore: ['mountain_pose', 'standing_forward_fold'],
            goodAfter: ['standing_forward_fold', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Fold forward and grab opposite elbows. Sway gently side to side.',
            relaxation: 'Let everything hang. Shake out any remaining tension.',
        },
    },

    // ==================== WARRIORS & LUNGES ====================

    warrior_1: {
        name: 'Warrior I',
        sanskrit: 'Virabhadrasana I',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'balance', 'energy', 'core'],
        bodyParts: ['legs', 'hips', 'arms', 'core'],
        contraindications: ['severe knee injury', 'high blood pressure'],
        transitions: {
            goodBefore: ['warrior_2', 'humble_warrior', 'warrior_3'],
            goodAfter: ['mountain_pose', 'standing_forward_fold', 'low_lunge'],
        },
        narrationHints: {
            beginner: 'Step one foot back and bend your front knee. Arms reach high.',
            energetic: 'Rise up warrior! Strong legs, proud chest, arms to the sky!',
            kids: 'You are a brave warrior! Lift your arms like a champion!',
        },
    },

    warrior_2: {
        name: 'Warrior II',
        sanskrit: 'Virabhadrasana II',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'balance', 'energy', 'core'],
        bodyParts: ['legs', 'hips', 'arms', 'core'],
        contraindications: ['severe knee injury'],
        transitions: {
            goodBefore: ['reverse_warrior', 'triangle_pose', 'extended_side_angle'],
            goodAfter: ['warrior_1', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Open your arms wide and gaze over your front hand',
            energetic: 'Stand strong and steady. You are a warrior!',
            kids: 'Stretch your arms out like airplane wings! Look at your front hand!',
        },
    },

    warrior_3: {
        name: 'Warrior III',
        sanskrit: 'Virabhadrasana III',
        category: 'balancing',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate', 'athletes'],
        focusAreas: ['balance', 'strength', 'core', 'energy'],
        bodyParts: ['legs', 'core', 'back', 'arms'],
        contraindications: ['balance disorders', 'ankle injury'],
        transitions: {
            goodBefore: ['standing_forward_fold', 'mountain_pose'],
            goodAfter: ['warrior_1', 'standing_forward_fold'],
        },
        narrationHints: {
            beginner: 'Lean forward and lift one leg behind you like a T shape',
            energetic: 'Fly like a superhero! Arms forward, leg back!',
        },
    },

    reverse_warrior: {
        name: 'Reverse Warrior',
        sanskrit: 'Viparita Virabhadrasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'strength', 'energy'],
        bodyParts: ['legs', 'obliques', 'arms'],
        contraindications: ['neck injury'],
        transitions: {
            goodBefore: ['extended_side_angle', 'standing_forward_fold'],
            goodAfter: ['warrior_2'],
        },
        narrationHints: {
            beginner: 'Reach your front arm up and back, feel the stretch along your side',
            energetic: 'Open up to the sky! Stretch long and breathe deep!',
        },
    },

    low_lunge: {
        name: 'Low Lunge',
        sanskrit: 'Anjaneyasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['flexibility', 'strength', 'energy'],
        bodyParts: ['hips', 'legs', 'core'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['lizard_pose', 'warrior_1', 'standing_forward_fold'],
            goodAfter: ['standing_forward_fold', 'mountain_pose', 'half_lift'],
        },
        narrationHints: {
            beginner: 'Step one foot forward into a gentle lunge. Lower your hips.',
            kids: 'Step forward like a brave explorer!',
        },
    },

    high_lunge: {
        name: 'High Lunge',
        sanskrit: 'Utthita Ashwa Sanchalanasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'balance', 'energy', 'core'],
        bodyParts: ['legs', 'hips', 'core', 'arms'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['warrior_1', 'warrior_3'],
            goodAfter: ['standing_forward_fold', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Lift your back knee off the ground and reach arms high',
            energetic: 'Power through your legs! Reach for the ceiling!',
        },
    },

    lizard_pose: {
        name: 'Lizard Pose',
        sanskrit: 'Utthan Pristhasana',
        category: 'hip_opener',
        level: 'intermediate',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'teens', 'intermediate', 'athletes'],
        focusAreas: ['flexibility', 'hip-opener'],
        bodyParts: ['hips', 'hamstrings', 'groin'],
        contraindications: ['hip injury', 'groin injury'],
        transitions: {
            goodBefore: ['pigeon_pose', 'low_lunge'],
            goodAfter: ['low_lunge', 'standing_forward_fold'],
        },
        narrationHints: {
            beginner: 'Place both hands inside your front foot. Let your hips soften.',
            kids: 'Crawl like a lizard on a warm rock! So low to the ground!',
        },
    },

    // ==================== BALANCING ====================

    tree_pose: {
        name: 'Tree Pose',
        sanskrit: 'Vrksasana',
        category: 'balancing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['kids', 'adults', 'teens', 'beginners', 'seniors'],
        focusAreas: ['balance', 'core', 'mindfulness', 'posture'],
        bodyParts: ['legs', 'core', 'hips'],
        contraindications: ['severe balance disorders'],
        transitions: {
            goodBefore: ['warrior_3', 'eagle_pose'],
            goodAfter: ['mountain_pose'],
        },
        narrationHints: {
            beginner: 'Place one foot on your inner calf or thigh. Find your balance.',
            kids: 'Stand on one leg like a tree! Can you reach your branches to the sky?',
            relaxation: 'Root down and find stillness within movement.',
        },
    },

    eagle_pose: {
        name: 'Eagle Pose',
        sanskrit: 'Garudasana',
        category: 'balancing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['balance', 'strength', 'flexibility'],
        bodyParts: ['legs', 'shoulders', 'arms', 'core'],
        contraindications: ['knee injury', 'shoulder injury'],
        transitions: {
            goodBefore: ['warrior_3', 'standing_forward_fold'],
            goodAfter: ['mountain_pose', 'tree_pose'],
        },
        narrationHints: {
            beginner: 'Cross one leg over the other and wrap your arms together',
            kids: 'Wrap yourself up like a pretzel eagle! Can you balance?',
        },
    },

    dancer_pose: {
        name: 'Dancer Pose',
        sanskrit: 'Natarajasana',
        category: 'balancing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['balance', 'flexibility', 'strength'],
        bodyParts: ['legs', 'back', 'shoulders', 'core'],
        contraindications: ['back injury', 'ankle injury'],
        transitions: {
            goodBefore: ['standing_forward_fold'],
            goodAfter: ['mountain_pose', 'tree_pose'],
        },
        narrationHints: {
            beginner: 'Hold one ankle behind you and lean forward gracefully',
            energetic: 'Reach and find your inner dancer! Grace and strength combined!',
        },
    },

    // ==================== TRIANGLES & SIDE ANGLES ====================

    triangle_pose: {
        name: 'Triangle Pose',
        sanskrit: 'Trikonasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'balance', 'strength'],
        bodyParts: ['legs', 'obliques', 'hips'],
        contraindications: ['low blood pressure', 'neck injury'],
        transitions: {
            goodBefore: ['half_moon', 'standing_forward_fold'],
            goodAfter: ['warrior_2', 'mountain_pose'],
        },
        narrationHints: {
            beginner: 'Step your feet wide apart. Reach one hand down, the other up.',
            kids: 'Make a triangle shape with your body! Reach to the sky!',
        },
    },

    extended_side_angle: {
        name: 'Extended Side Angle',
        sanskrit: 'Utthita Parsvakonasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'flexibility', 'core'],
        bodyParts: ['legs', 'obliques', 'arms'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['reverse_warrior', 'standing_forward_fold'],
            goodAfter: ['warrior_2'],
        },
        narrationHints: {
            beginner: 'Bend your front knee and place your elbow on it. Reach the other arm overhead.',
        },
    },

    half_moon: {
        name: 'Half Moon',
        sanskrit: 'Ardha Chandrasana',
        category: 'balancing',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['balance', 'strength', 'core'],
        bodyParts: ['legs', 'core', 'hips'],
        contraindications: ['balance disorders'],
        transitions: {
            goodBefore: ['standing_forward_fold'],
            goodAfter: ['triangle_pose', 'warrior_2'],
        },
        narrationHints: {
            beginner: 'Balance on one leg and open your body to the side like a half moon',
        },
    },

    // ==================== FLOOR & PRONE ====================

    cobra_pose: {
        name: 'Cobra Pose',
        sanskrit: 'Bhujangasana',
        category: 'backbend',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['kids', 'adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'back-pain', 'posture', 'energy'],
        bodyParts: ['spine', 'chest', 'arms'],
        contraindications: ['severe back injury', 'pregnancy'],
        transitions: {
            goodBefore: ['upward_facing_dog', 'childs_pose'],
            goodAfter: ['downward_facing_dog', 'childs_pose'],
        },
        narrationHints: {
            beginner: 'Lie on your belly. Press your hands down and lift your chest gently.',
            kids: 'Ssssss! Rise up like a cobra snake! Hiss!',
            relaxation: 'Gently lift your heart forward. Feel your chest open.',
        },
    },

    upward_facing_dog: {
        name: 'Upward Facing Dog',
        sanskrit: 'Urdhva Mukha Svanasana',
        category: 'backbend',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate', 'athletes'],
        focusAreas: ['strength', 'flexibility', 'posture', 'energy'],
        bodyParts: ['spine', 'arms', 'chest', 'core'],
        contraindications: ['back injury', 'wrist injury'],
        transitions: {
            goodBefore: ['downward_facing_dog'],
            goodAfter: ['cobra_pose', 'plank_pose'],
        },
        narrationHints: {
            beginner: 'Press into your hands and lift your body. Legs hover off the mat.',
        },
    },

    locust_pose: {
        name: 'Locust Pose',
        sanskrit: 'Salabhasana',
        category: 'backbend',
        level: 'beginner',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['strength', 'back-pain', 'posture'],
        bodyParts: ['back', 'glutes', 'legs'],
        contraindications: ['pregnancy', 'severe back injury'],
        transitions: {
            goodBefore: ['cobra_pose', 'bow_pose'],
            goodAfter: ['childs_pose'],
        },
        narrationHints: {
            beginner: 'Lie on your belly. Lift your chest, arms, and legs off the mat.',
            kids: 'Fly like a superhero! Lift everything off the ground!',
        },
    },

    bow_pose: {
        name: 'Bow Pose',
        sanskrit: 'Dhanurasana',
        category: 'backbend',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['flexibility', 'strength', 'energy'],
        bodyParts: ['spine', 'chest', 'legs', 'shoulders'],
        contraindications: ['back injury', 'pregnancy', 'neck injury'],
        transitions: {
            goodBefore: ['childs_pose'],
            goodAfter: ['locust_pose', 'cobra_pose'],
        },
        narrationHints: {
            beginner: 'Grab your ankles and rock gently like a bow.',
        },
    },

    plank_pose: {
        name: 'Plank Pose',
        sanskrit: 'Phalakasana',
        category: 'floor',
        level: 'beginner',
        duration: { min: 10, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['strength', 'core', 'energy'],
        bodyParts: ['core', 'arms', 'shoulders', 'legs'],
        contraindications: ['wrist injury', 'shoulder injury'],
        transitions: {
            goodBefore: ['downward_facing_dog', 'cobra_pose', 'chaturanga'],
            goodAfter: ['mountain_pose', 'cat_cow'],
        },
        narrationHints: {
            beginner: 'Hold your body straight like a plank of wood. Strong core!',
            kids: 'Be a surfboard! Flat and strong!',
        },
    },

    downward_facing_dog: {
        name: 'Downward Facing Dog',
        sanskrit: 'Adho Mukha Svanasana',
        category: 'inversion',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['kids', 'adults', 'teens', 'beginners', 'athletes'],
        focusAreas: ['flexibility', 'strength', 'energy', 'core'],
        bodyParts: ['full-body', 'hamstrings', 'shoulders', 'arms'],
        contraindications: ['high blood pressure', 'wrist injury'],
        transitions: {
            goodBefore: ['standing_forward_fold', 'warrior_1', 'three_legged_dog'],
            goodAfter: ['cat_cow', 'plank_pose', 'childs_pose'],
        },
        narrationHints: {
            beginner: 'Push your hips up and back. Press your heels toward the mat.',
            kids: 'Make an upside-down V! Woof woof! You are a happy puppy!',
            energetic: 'Lengthen your spine and press the mat away from you.',
        },
    },

    three_legged_dog: {
        name: 'Three-Legged Dog',
        sanskrit: 'Eka Pada Adho Mukha Svanasana',
        category: 'inversion',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['balance', 'strength', 'core'],
        bodyParts: ['legs', 'core', 'arms', 'hips'],
        contraindications: ['wrist injury', 'shoulder injury'],
        transitions: {
            goodBefore: ['low_lunge', 'pigeon_pose'],
            goodAfter: ['downward_facing_dog'],
        },
        narrationHints: {
            beginner: 'From downward dog, lift one leg high behind you.',
        },
    },

    // ==================== SEATED ====================

    seated_forward_fold: {
        name: 'Seated Forward Fold',
        sanskrit: 'Paschimottanasana',
        category: 'seated',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'teens', 'beginners', 'seniors'],
        focusAreas: ['flexibility', 'relaxation', 'stress-relief'],
        bodyParts: ['hamstrings', 'spine', 'calves'],
        contraindications: ['severe back injury'],
        transitions: {
            goodBefore: ['butterfly_pose', 'head_to_knee'],
            goodAfter: ['easy_pose', 'staff_pose'],
        },
        narrationHints: {
            beginner: 'Sit down and extend both legs forward. Fold gently toward your legs.',
            relaxation: 'With each exhale, fold a little deeper. No force, just gravity.',
        },
    },

    staff_pose: {
        name: 'Staff Pose',
        sanskrit: 'Dandasana',
        category: 'seated',
        level: 'beginner',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'beginners', 'seniors'],
        focusAreas: ['posture', 'core'],
        bodyParts: ['spine', 'core', 'legs'],
        contraindications: [],
        transitions: {
            goodBefore: ['seated_forward_fold', 'boat_pose'],
            goodAfter: ['easy_pose'],
        },
        narrationHints: {
            beginner: 'Sit tall with your legs straight in front of you.',
        },
    },

    head_to_knee: {
        name: 'Head to Knee Pose',
        sanskrit: 'Janu Sirsasana',
        category: 'seated',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'relaxation'],
        bodyParts: ['hamstrings', 'spine', 'hips'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['seated_forward_fold', 'butterfly_pose'],
            goodAfter: ['staff_pose', 'easy_pose'],
        },
        narrationHints: {
            beginner: 'Extend one leg and fold forward over it. Breathe and relax.',
        },
    },

    boat_pose: {
        name: 'Boat Pose',
        sanskrit: 'Navasana',
        category: 'seated',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate', 'athletes'],
        focusAreas: ['core', 'strength', 'balance'],
        bodyParts: ['core', 'hip-flexors', 'legs'],
        contraindications: ['low back injury', 'pregnancy'],
        transitions: {
            goodBefore: ['seated_forward_fold'],
            goodAfter: ['staff_pose', 'easy_pose'],
        },
        narrationHints: {
            beginner: 'Balance on your sit bones and lift your legs. Hold strong!',
            kids: "You're a boat sailing on the sea! Don't fall in the water!",
        },
    },

    // ==================== HIP OPENERS ====================

    butterfly_pose: {
        name: 'Butterfly Pose',
        sanskrit: 'Baddha Konasana',
        category: 'hip_opener',
        level: 'beginner',
        duration: { min: 20, max: 90 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['flexibility', 'relaxation', 'digestion'],
        bodyParts: ['hips', 'groin', 'inner-thighs'],
        contraindications: ['groin injury'],
        transitions: {
            goodBefore: ['supine_butterfly', 'seated_forward_fold'],
            goodAfter: ['easy_pose', 'seated_forward_fold'],
        },
        narrationHints: {
            beginner: 'Bring the soles of your feet together. Let your knees drop.',
            kids: 'Flutter your knees like butterfly wings! Fly butterfly, fly!',
            relaxation: 'Sit tall, let your hips open gently with each breath.',
        },
    },

    pigeon_pose: {
        name: 'Pigeon Pose',
        sanskrit: 'Eka Pada Rajakapotasana',
        category: 'hip_opener',
        level: 'intermediate',
        duration: { min: 30, max: 120 },
        audiences: ['adults', 'teens', 'intermediate', 'athletes'],
        focusAreas: ['flexibility', 'stress-relief'],
        bodyParts: ['hips', 'glutes', 'groin'],
        contraindications: ['knee injury', 'hip injury'],
        transitions: {
            goodBefore: ['sleeping_pigeon', 'downward_facing_dog'],
            goodAfter: ['downward_facing_dog', 'three_legged_dog'],
        },
        narrationHints: {
            beginner: 'One leg bent in front, the other straight behind you. Let your hips release.',
            relaxation: 'This pose holds emotions. Breathe and let go.',
        },
    },

    frog_pose: {
        name: 'Frog Pose',
        sanskrit: 'Mandukasana',
        category: 'hip_opener',
        level: 'intermediate',
        duration: { min: 30, max: 90 },
        audiences: ['adults', 'intermediate'],
        focusAreas: ['flexibility'],
        bodyParts: ['hips', 'groin', 'inner-thighs'],
        contraindications: ['groin injury', 'knee injury'],
        transitions: {
            goodBefore: ['childs_pose'],
            goodAfter: ['childs_pose', 'cat_cow'],
        },
        narrationHints: {
            beginner: 'Widen your knees apart and lower your hips toward the mat.',
            kids: 'Ribbit! Ribbit! Be a frog in a pond!',
        },
    },

    // ==================== SUPINE ====================

    supine_twist: {
        name: 'Supine Twist',
        sanskrit: 'Supta Matsyendrasana',
        category: 'twist',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['kids', 'adults', 'seniors', 'beginners'],
        focusAreas: ['relaxation', 'flexibility', 'digestion', 'back-pain'],
        bodyParts: ['spine', 'hips', 'shoulders'],
        contraindications: ['severe back injury'],
        transitions: {
            goodBefore: ['knees_to_chest', 'happy_baby'],
            goodAfter: ['savasana', 'knees_to_chest'],
        },
        narrationHints: {
            beginner: 'Lie on your back and gently drop your knees to one side.',
            relaxation: 'Let gravity do the work. Release your spine completely.',
        },
    },

    knees_to_chest: {
        name: 'Knees to Chest',
        sanskrit: 'Apanasana',
        category: 'supine',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['relaxation', 'back-pain', 'digestion'],
        bodyParts: ['lower-back', 'hips'],
        contraindications: [],
        transitions: {
            goodBefore: ['supine_twist', 'happy_baby', 'savasana'],
            goodAfter: ['bridge_pose', 'supine_twist'],
        },
        narrationHints: {
            beginner: 'Hug your knees toward your chest. Feel your lower back relax.',
            kids: 'Give yourself a big bear hug! Squeeze your knees tight!',
        },
    },

    happy_baby: {
        name: 'Happy Baby',
        sanskrit: 'Ananda Balasana',
        category: 'supine',
        level: 'beginner',
        duration: { min: 20, max: 60 },
        audiences: ['kids', 'adults', 'beginners'],
        focusAreas: ['relaxation', 'flexibility'],
        bodyParts: ['hips', 'groin', 'lower-back'],
        contraindications: ['neck injury', 'pregnancy'],
        transitions: {
            goodBefore: ['savasana', 'supine_twist'],
            goodAfter: ['knees_to_chest', 'supine_twist'],
        },
        narrationHints: {
            beginner: 'Hold your feet with your hands. Open your knees wide.',
            kids: 'Grab your feet and roll like a happy baby! Hehe!',
        },
    },

    legs_up_the_wall: {
        name: 'Legs Up the Wall',
        sanskrit: 'Viparita Karani',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 60, max: 300 },
        audiences: ['adults', 'seniors', 'beginners'],
        focusAreas: ['relaxation', 'stress-relief', 'sleep'],
        bodyParts: ['legs', 'lower-back', 'hips'],
        contraindications: ['glaucoma', 'high blood pressure'],
        transitions: {
            goodBefore: ['savasana'],
            goodAfter: ['supine_twist', 'knees_to_chest'],
        },
        narrationHints: {
            beginner: 'Extend your legs up against the wall. Rest completely.',
            relaxation: 'This is one of the most healing poses. Just rest and breathe.',
        },
    },

    bridge_pose: {
        name: 'Bridge Pose',
        sanskrit: 'Setu Bandhasana',
        category: 'backbend',
        level: 'beginner',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['strength', 'flexibility', 'back-pain', 'core'],
        bodyParts: ['glutes', 'spine', 'chest', 'legs'],
        contraindications: ['neck injury'],
        transitions: {
            goodBefore: ['wheel_pose', 'supine_twist'],
            goodAfter: ['knees_to_chest', 'supine_twist'],
        },
        narrationHints: {
            beginner: 'Lie on your back, bend your knees, and lift your hips high.',
            kids: 'Make a bridge for the cars to drive under! Lift your tummy up!',
        },
    },

    supine_butterfly: {
        name: 'Supine Butterfly',
        sanskrit: 'Supta Baddha Konasana',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 30, max: 180 },
        audiences: ['adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['relaxation', 'flexibility', 'sleep'],
        bodyParts: ['hips', 'groin', 'chest'],
        contraindications: ['groin injury'],
        transitions: {
            goodBefore: ['savasana'],
            goodAfter: ['butterfly_pose', 'knees_to_chest'],
        },
        narrationHints: {
            beginner: 'Lie back and let your knees fall open with feet together.',
            relaxation: 'Open your heart to the sky. Let everything melt into the mat.',
        },
    },

    fish_pose: {
        name: 'Fish Pose',
        sanskrit: 'Matsyasana',
        category: 'backbend',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['flexibility', 'breathing', 'energy'],
        bodyParts: ['chest', 'throat', 'spine'],
        contraindications: ['neck injury', 'back injury'],
        transitions: {
            goodBefore: ['savasana'],
            goodAfter: ['knees_to_chest'],
        },
        narrationHints: {
            beginner: 'Arch your back and rest the top of your head gently on the mat.',
            kids: 'Glub glub! Be a fish swimming in the sea!',
        },
    },

    // ==================== RESTORATIVE / FINAL ====================

    savasana: {
        name: 'Savasana',
        sanskrit: 'Savasana',
        category: 'restorative',
        level: 'beginner',
        duration: { min: 60, max: 300 },
        audiences: ['kids', 'adults', 'seniors', 'beginners', 'pregnant'],
        focusAreas: ['relaxation', 'stress-relief', 'sleep', 'meditation'],
        bodyParts: ['full-body'],
        contraindications: [],
        transitions: {
            goodBefore: [],
            goodAfter: ['knees_to_chest', 'supine_twist', 'happy_baby'],
        },
        narrationHints: {
            beginner: 'Lie down completely. Let every part of your body relax.',
            kids: 'Pretend you are a sleeping starfish! So quiet and still...',
            relaxation: 'Release everything. You have nothing to do. Just be.',
        },
    },

    seated_meditation: {
        name: 'Seated Meditation',
        sanskrit: 'Dhyana',
        category: 'breathing',
        level: 'beginner',
        duration: { min: 60, max: 300 },
        audiences: ['adults', 'seniors', 'beginners'],
        focusAreas: ['meditation', 'mindfulness', 'breathing', 'stress-relief'],
        bodyParts: ['spine'],
        contraindications: [],
        transitions: {
            goodBefore: [],
            goodAfter: ['easy_pose'],
        },
        narrationHints: {
            beginner: 'Close your eyes and focus on the rhythm of your breath.',
            relaxation: 'There is nothing to do. Just sit and be present.',
        },
    },

    // ==================== ADDITIONAL MISC ====================

    camel_pose: {
        name: 'Camel Pose',
        sanskrit: 'Ustrasana',
        category: 'backbend',
        level: 'intermediate',
        duration: { min: 10, max: 30 },
        audiences: ['adults', 'teens', 'intermediate'],
        focusAreas: ['flexibility', 'energy', 'posture'],
        bodyParts: ['spine', 'chest', 'hips'],
        contraindications: ['back injury', 'neck injury'],
        transitions: {
            goodBefore: ['childs_pose'],
            goodAfter: ['childs_pose'],
        },
        narrationHints: {
            beginner: 'Kneel and reach back toward your heels. Open your chest to the sky.',
        },
    },

    humble_warrior: {
        name: 'Humble Warrior',
        sanskrit: 'Baddha Virabhadrasana',
        category: 'standing',
        level: 'intermediate',
        duration: { min: 15, max: 45 },
        audiences: ['adults', 'intermediate'],
        focusAreas: ['strength', 'flexibility', 'mindfulness'],
        bodyParts: ['legs', 'shoulders', 'hips'],
        contraindications: ['shoulder injury'],
        transitions: {
            goodBefore: ['warrior_2', 'standing_forward_fold'],
            goodAfter: ['warrior_1'],
        },
        narrationHints: {
            beginner: 'Clasp your hands behind your back and fold forward inside your front leg.',
        },
    },

    sleeping_pigeon: {
        name: 'Sleeping Pigeon',
        sanskrit: 'Eka Pada Rajakapotasana (folded)',
        category: 'hip_opener',
        level: 'intermediate',
        duration: { min: 30, max: 120 },
        audiences: ['adults', 'intermediate'],
        focusAreas: ['flexibility', 'relaxation', 'stress-relief'],
        bodyParts: ['hips', 'glutes'],
        contraindications: ['knee injury', 'hip injury'],
        transitions: {
            goodBefore: ['downward_facing_dog'],
            goodAfter: ['pigeon_pose', 'downward_facing_dog'],
        },
        narrationHints: {
            relaxation: 'Fold forward over your bent leg and rest. Breathe into your hip.',
        },
    },

    gate_pose: {
        name: 'Gate Pose',
        sanskrit: 'Parighasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 30 },
        audiences: ['adults', 'beginners'],
        focusAreas: ['flexibility', 'breathing'],
        bodyParts: ['obliques', 'hips', 'legs'],
        contraindications: ['knee injury'],
        transitions: {
            goodBefore: ['camel_pose'],
            goodAfter: ['childs_pose'],
        },
        narrationHints: {
            beginner: 'Kneel on one knee, extend the other leg, and stretch sideways.',
        },
    },

    wide_legged_forward_fold: {
        name: 'Wide-Legged Forward Fold',
        sanskrit: 'Prasarita Padottanasana',
        category: 'standing',
        level: 'beginner',
        duration: { min: 15, max: 60 },
        audiences: ['adults', 'teens', 'beginners'],
        focusAreas: ['flexibility', 'relaxation'],
        bodyParts: ['hamstrings', 'spine', 'inner-thighs'],
        contraindications: ['low blood pressure'],
        transitions: {
            goodBefore: ['standing_forward_fold'],
            goodAfter: ['mountain_pose', 'triangle_pose'],
        },
        narrationHints: {
            beginner: 'Step your feet wide apart and fold forward between your legs.',
        },
    },

    // Include the extended database
    ...EXTENDED_POSES,
    ...EXTENDED_POSES_2,
    ...EXTENDED_POSES_3,
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get total number of poses in the database
 */
export function getPoseCount() {
    return Object.keys(POSES_DB).length;
}

/**
 * Get a single pose by ID
 */
export function getPose(poseId) {
    return POSES_DB[poseId] ? { id: poseId, ...POSES_DB[poseId] } : null;
}

/**
 * Get all pose IDs
 */
export function getAllPoseIds() {
    return Object.keys(POSES_DB);
}

/**
 * Smart pose finder — filter by multiple criteria
 */
export function findPoses(filters = {}) {
    let results = Object.entries(POSES_DB);

    if (filters.category) {
        const cats = Array.isArray(filters.category) ? filters.category : [filters.category];
        results = results.filter(([_, p]) => cats.includes(p.category));
    }
    if (filters.level) {
        const levels = { beginner: 0, intermediate: 1, advanced: 2, master: 3 };
        results = results.filter(([_, p]) => levels[p.level] <= levels[filters.level]);
    }
    if (filters.audience) {
        results = results.filter(([_, p]) => p.audiences.includes(filters.audience));
    }
    if (filters.focusArea) {
        results = results.filter(([_, p]) => p.focusAreas.includes(filters.focusArea));
    }
    if (filters.bodyPart) {
        results = results.filter(([_, p]) => p.bodyParts.includes(filters.bodyPart));
    }
    if (filters.exclude && filters.exclude.length > 0) {
        const excludeSet = new Set(filters.exclude);
        results = results.filter(([id]) => !excludeSet.has(id));
    }
    if (filters.mustInclude && filters.mustInclude.length > 0) {
        // These are handled separately — we ensure they're in the final result
    }

    return results.map(([id, pose]) => ({ id, ...pose }));
}

/**
 * Get all unique categories that have poses matching filters
 */
export function getAvailableCategories(filters = {}) {
    const poses = findPoses(filters);
    const cats = new Set(poses.map(p => p.category));
    return [...cats].sort((a, b) => (POSE_CATEGORIES[a]?.order || 99) - (POSE_CATEGORIES[b]?.order || 99));
}

/**
 * Get poses grouped by category
 */
export function getPosesGrouped(filters = {}) {
    const poses = findPoses(filters);
    const grouped = {};
    for (const pose of poses) {
        if (!grouped[pose.category]) grouped[pose.category] = [];
        grouped[pose.category].push(pose);
    }
    return grouped;
}
