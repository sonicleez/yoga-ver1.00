/**
 * LANGUAGES — Multi-language support for script generation
 * 
 * Provides language configs, translation hint templates, and
 * AI instruction templates for 10 languages.
 */

// ============================================================
// LANGUAGE DEFINITIONS
// ============================================================

export const LANGUAGES = {
    en: {
        name: 'English',
        flag: '🇬🇧',
        code: 'en',
        nativeName: 'English',
        aiInstruction: 'Write all narration in fluent, natural English. Use simple, clear sentences appropriate for the audience.',
        breathWords: {
            inhale: ['inhale', 'breathe in', 'take a deep breath'],
            exhale: ['exhale', 'breathe out', 'release your breath'],
            hold: ['hold', 'pause', 'stay here'],
        },
        introTemplates: [
            'Welcome to this {category} yoga session.',
            'Let\'s begin our {duration}-minute {category} yoga practice.',
            'Find a comfortable space and get ready for today\'s {category} yoga.',
        ],
        outroTemplates: [
            'Thank you for practicing with us today.',
            'Your practice is complete. Take a moment to rest.',
            'Well done! Remember to carry this calm feeling with you.',
        ],
        transitionWords: ['gently', 'slowly', 'now', 'from here', 'next', 'let\'s move into'],
    },

    vi: {
        name: 'Tiếng Việt',
        flag: '🇻🇳',
        code: 'vi',
        nativeName: 'Tiếng Việt',
        aiInstruction: 'Viết lời dẫn bằng tiếng Việt tự nhiên, dễ hiểu, nhẹ nhàng. Dùng câu ngắn gọn phù hợp với đối tượng.',
        breathWords: {
            inhale: ['hít vào', 'hít sâu', 'thở vào'],
            exhale: ['thở ra', 'từ từ thở ra', 'nhẹ nhàng thở ra'],
            hold: ['giữ', 'dừng lại', 'ở đây'],
        },
        introTemplates: [
            'Chào mừng bạn đến với buổi tập yoga {category} hôm nay.',
            'Hãy cùng bắt đầu {duration} phút yoga {category}.',
            'Tìm một không gian thoải mái và sẵn sàng cho bài tập yoga {category} nhé.',
        ],
        outroTemplates: [
            'Cảm ơn bạn đã tập luyện cùng chúng tôi hôm nay.',
            'Bài tập đã hoàn thành. Hãy nghỉ ngơi một chút.',
            'Rất tốt! Hãy mang theo cảm giác bình yên này suốt cả ngày nhé.',
        ],
        transitionWords: ['nhẹ nhàng', 'từ từ', 'bây giờ', 'từ đây', 'tiếp theo', 'hãy chuyển sang'],
    },

    ja: {
        name: 'Japanese',
        flag: '🇯🇵',
        code: 'ja',
        nativeName: '日本語',
        aiInstruction: '自然で穏やかな日本語でナレーションを書いてください。聴衆に適したシンプルで明確な文を使ってください。',
        breathWords: {
            inhale: ['息を吸って', '深く吸い込んで'],
            exhale: ['息を吐いて', 'ゆっくり吐いて'],
            hold: ['キープして', 'このまま'],
        },
        introTemplates: [
            'この{category}ヨガセッションへようこそ。',
            '{duration}分の{category}ヨガを始めましょう。',
        ],
        outroTemplates: [
            '今日の練習お疲れさまでした。',
            '練習が終了しました。しばらく休んでください。',
        ],
        transitionWords: ['ゆっくりと', 'そっと', '次に', 'ここから'],
    },

    ko: {
        name: 'Korean',
        flag: '🇰🇷',
        code: 'ko',
        nativeName: '한국어',
        aiInstruction: '자연스럽고 차분한 한국어로 나레이션을 작성하세요. 대상에 맞는 간단하고 명확한 문장을 사용하세요.',
        breathWords: {
            inhale: ['숨을 들이쉬세요', '깊게 들이마시세요'],
            exhale: ['숨을 내쉬세요', '천천히 내쉬세요'],
            hold: ['유지하세요', '여기서 머물러요'],
        },
        introTemplates: [
            '이 {category} 요가 세션에 오신 것을 환영합니다.',
            '{duration}분 {category} 요가를 시작해봅시다.',
        ],
        outroTemplates: [
            '오늘 함께 연습해주셔서 감사합니다.',
            '연습이 완료되었습니다. 잠시 쉬어가세요.',
        ],
        transitionWords: ['부드럽게', '천천히', '이제', '여기서', '다음으로'],
    },

    zh: {
        name: 'Chinese (Simplified)',
        flag: '🇨🇳',
        code: 'zh',
        nativeName: '中文',
        aiInstruction: '用自然流畅的中文写叙述。使用简单明了的句子，适合目标听众。',
        breathWords: {
            inhale: ['吸气', '深深吸入'],
            exhale: ['呼气', '慢慢呼出'],
            hold: ['保持', '停留在这里'],
        },
        introTemplates: [
            '欢迎来到这个{category}瑜伽课程。',
            '让我们开始{duration}分钟的{category}瑜伽练习。',
        ],
        outroTemplates: [
            '感谢你今天的练习。',
            '练习结束了。请休息一下。',
        ],
        transitionWords: ['轻轻地', '慢慢地', '现在', '接下来', '从这里'],
    },

    es: {
        name: 'Spanish',
        flag: '🇪🇸',
        code: 'es',
        nativeName: 'Español',
        aiInstruction: 'Escribe la narración en español fluido y natural. Usa oraciones simples y claras adecuadas para la audiencia.',
        breathWords: {
            inhale: ['inhala', 'respira profundo', 'toma aire'],
            exhale: ['exhala', 'suelta el aire', 'libera'],
            hold: ['mantén', 'quédate aquí', 'sostén'],
        },
        introTemplates: [
            'Bienvenido a esta sesión de yoga {category}.',
            'Comencemos nuestra práctica de yoga {category} de {duration} minutos.',
        ],
        outroTemplates: [
            'Gracias por practicar hoy con nosotros.',
            'Tu práctica ha terminado. Tómate un momento para descansar.',
        ],
        transitionWords: ['suavemente', 'lentamente', 'ahora', 'desde aquí', 'siguiente'],
    },

    fr: {
        name: 'French',
        flag: '🇫🇷',
        code: 'fr',
        nativeName: 'Français',
        aiInstruction: 'Écrivez la narration en français naturel et fluide. Utilisez des phrases simples et claires adaptées au public.',
        breathWords: {
            inhale: ['inspirez', 'prenez une grande inspiration'],
            exhale: ['expirez', 'libérez le souffle'],
            hold: ['maintenez', 'restez ici'],
        },
        introTemplates: [
            'Bienvenue dans cette séance de yoga {category}.',
            'Commençons notre pratique de yoga {category} de {duration} minutes.',
        ],
        outroTemplates: [
            'Merci d\'avoir pratiqué avec nous aujourd\'hui.',
            'Votre pratique est terminée. Prenez un moment pour vous reposer.',
        ],
        transitionWords: ['doucement', 'lentement', 'maintenant', 'à partir d\'ici', 'ensuite'],
    },

    de: {
        name: 'German',
        flag: '🇩🇪',
        code: 'de',
        nativeName: 'Deutsch',
        aiInstruction: 'Schreibe die Erzählung in natürlichem, fließendem Deutsch. Verwende einfache, klare Sätze, die für das Publikum geeignet sind.',
        breathWords: {
            inhale: ['einatmen', 'tief einatmen'],
            exhale: ['ausatmen', 'langsam ausatmen'],
            hold: ['halten', 'hier bleiben'],
        },
        introTemplates: [
            'Willkommen zu dieser {category}-Yoga-Sitzung.',
            'Beginnen wir unsere {duration}-minütige {category}-Yoga-Übung.',
        ],
        outroTemplates: [
            'Vielen Dank, dass du heute mit uns geübt hast.',
            'Deine Übung ist beendet. Nimm dir einen Moment zum Ausruhen.',
        ],
        transitionWords: ['sanft', 'langsam', 'jetzt', 'von hier aus', 'als nächstes'],
    },

    pt: {
        name: 'Portuguese',
        flag: '🇧🇷',
        code: 'pt',
        nativeName: 'Português',
        aiInstruction: 'Escreva a narração em português natural e fluido. Use frases simples e claras adequadas para o público.',
        breathWords: {
            inhale: ['inspire', 'respire fundo'],
            exhale: ['expire', 'solte o ar'],
            hold: ['mantenha', 'fique aqui'],
        },
        introTemplates: [
            'Bem-vindo a esta sessão de yoga {category}.',
            'Vamos começar nossa prática de yoga {category} de {duration} minutos.',
        ],
        outroTemplates: [
            'Obrigado por praticar conosco hoje.',
            'Sua prática está completa. Reserve um momento para descansar.',
        ],
        transitionWords: ['suavemente', 'lentamente', 'agora', 'daqui', 'em seguida'],
    },

    hi: {
        name: 'Hindi',
        flag: '🇮🇳',
        code: 'hi',
        nativeName: 'हिन्दी',
        aiInstruction: 'स्वाभाविक और प्रवाहमय हिंदी में कथन लिखें। दर्शकों के लिए उपयुक्त सरल और स्पष्ट वाक्यों का प्रयोग करें।',
        breathWords: {
            inhale: ['साँस लें', 'गहरी साँस लें'],
            exhale: ['साँस छोड़ें', 'धीरे-धीरे छोड़ें'],
            hold: ['रुकें', 'यहाँ रहें'],
        },
        introTemplates: [
            'इस {category} योग सत्र में आपका स्वागत है।',
            'आइए {duration} मिनट का {category} योग अभ्यास शुरू करें।',
        ],
        outroTemplates: [
            'आज हमारे साथ अभ्यास करने के लिए धन्यवाद।',
            'आपका अभ्यास पूरा हुआ। थोड़ा आराम करें।',
        ],
        transitionWords: ['धीरे-धीरे', 'अब', 'यहाँ से', 'अगला'],
    },
};

// ============================================================
// API
// ============================================================

/**
 * Get all language options for UI dropdown
 */
export function getLanguageOptions() {
    return Object.entries(LANGUAGES).map(([code, lang]) => ({
        code,
        name: lang.name,
        flag: lang.flag,
        nativeName: lang.nativeName,
    }));
}

/**
 * Get specific language config
 */
export function getLanguage(code) {
    return LANGUAGES[code] || LANGUAGES.en;
}

/**
 * Get AI instruction for language
 */
export function getLanguageInstruction(code) {
    const lang = getLanguage(code);
    return lang.aiInstruction;
}

/**
 * Pick a random intro template and fill variables
 */
export function getRandomIntro(code, vars = {}) {
    const lang = getLanguage(code);
    const templates = lang.introTemplates;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return fillTemplate(template, vars);
}

/**
 * Pick a random outro template and fill variables
 */
export function getRandomOutro(code, vars = {}) {
    const lang = getLanguage(code);
    const templates = lang.outroTemplates;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return fillTemplate(template, vars);
}

/**
 * Get random breath words for language
 */
export function getBreathWords(code) {
    const lang = getLanguage(code);
    return {
        inhale: randomPick(lang.breathWords.inhale),
        exhale: randomPick(lang.breathWords.exhale),
        hold: randomPick(lang.breathWords.hold),
    };
}

// ============================================================
// UTILITIES
// ============================================================

function fillTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || key);
}

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
