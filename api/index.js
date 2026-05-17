/**
 * جسر محاكاة المعهد التعليمي الذكي فائق الدقة - Vercel Serverless
 * المبرمج: كامل الروافي
 * التحديث: تفعيل آلية التثبت المنطقي المزدوج والتحكم بالأوامر العلوية للتاريخ اللامحدود
 */

export default async function handler(req, res) {
    // إعدادات الـ CORS الكاملة للتعامل مع أي استضافة وهاتف محمول
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).send("✅ جسر محاكاة المعهد يعمل بنظام التثبت المنطقي والمطابقة المزدوجة!");
    }

    try {
        let bodyData = req.body;
        if (typeof bodyData === 'string') {
            try { 
                bodyData = JSON.parse(bodyData); 
            } catch (e) {
                return res.status(400).json({ error: "بيانات JSON غير صالحة" });
            }
        }

        // استقبال البيانات الشاملة القادمة من الواجهة المستخرجة من Awardspace
        const memberName = bodyData?.member_name || "عضو مجهول";
        const memberRole = bodyData?.member_role || "student"; // manager, teacher, student
        const specialty = bodyData?.specialty || "General";
        const currentLevel = bodyData?.level || 1;
        const currentStatus = bodyData?.status || "Idle";
        
        // سجل المحادثات الكامل واللامحدود الممرر مباشرة من قاعدة البيانات
        const fullChatHistory = bodyData?.chat_history || [];
        
        // الأوامر العلوية الصادرة منك أنت كمستخدم للنظام
        const activeHumanCommands = bodyData?.active_commands || "لا توجد أوامر علوية معلقة حالياً من المستخدم.";

        const hf_token = "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"; 
        const API_URL = "https://router.huggingface.co/v1/chat/completions";

        // 🧠 الـ System Prompt المطور بنظام التحقق المزدوج الصارم والمطابقة الواقعية لأدوار المعهد
        let systemPrompt = `أنت في محاكاة واقعية جداً بنسبة 100% لمعهد تعليمي ذكي ومتكامل.
تم تطويرك وبرمجتك بواسطة المبرمج المحترف (كامل الروافي).

تؤدي الآن دور الشخصية التالية بناءً على البيانات الحية:
- الاسم: ${memberName}
- الدور: ${memberRole === 'manager' ? 'المدير العام للمعهد' : memberRole === 'teacher' ? 'المعلم' : 'التلميذ'}
- التخصص/الفصل: ${specialty}
- المستوى الحقيقي الحالي: Level ${currentLevel}
- الحالة الحالية: ${currentStatus}

🛑 بروتوكول التفكير والتحقق الصارم (طبق هذه الخطوات داخلياً قبل صياغة ردك):

الخطوة 1 [تحديد السياق والأوامر العلوية]: اقرأ بتمعن وعمق الأوامر الصادرة من المستخدم الخارجي:
(${activeHumanCommands})
إذا كنت تلعب دور "المدير العام" ولديك أمر موقوت أو فوري (مثل تفقد المعلم أحمد الساعة 10:30)، يجب أن تمتص هذا الأمر وتبدأ في تنفيذه داخل المحاكاة فوراً بإصدار توجيهاتك الصارمة لبقية الطاقم دون نسيان.

الخطوة 2 [التثبت والتحقق من الهوية والأدوار]: تذكر هويتك وتاريخك بالكامل في المحادثات السابقة الممررة لك. يمنع منعاً باتاً الخروج عن حدود شخصيتك الحالية (المعلم لا يتصرف كمدير، والتلميذ يلتزم بحدود الأدب والاستعداد للفصل والامتحان).

الخطوة 3 [المطابقة المزدوجة]: حلل ردود بقية الأعضاء السابقة في السجل. أجب بأسلوب يحاكي الواقع تماماً؛ إذا أعلن المدير عن تفتيش، يظهر المعلم احترامه ويوجه تلاميذه، ويظهر التلميذ انضباطه أو توتره الواقعي من الامتحانات.

🎯 أسلوب الحوار وإخراج الرد:
- تحدث بحرية تامة باللغة أو اللهجة التي تناسب السياق الحالي (عربية فصحى، دارجة، إلخ) وبشكل طبيعي، بليغ ومفهوم.
- صغ ردودك في جمل كاملة ومنظمة، وتجنب الردود الآلية أو الروبوتية الجافة.

🛑 الذاكرة الحية والسجل الحالي للمحاكاة (اعتمد عليه كمرجع لخطوتك القادمة):`;

        const finalMessages = [
            { "role": "system", "content": systemPrompt },
            ...fullChatHistory
        ];

        // تأمين المحاكاة الذاتية في حال كانت بداية تشغيل الشخصية
        if (finalMessages.length === 1) {
            finalMessages.push({ "role": "user", "content": "ابدأ دورك اللحظي الآن في المعهد وتفاعل مع الأحداث الحالية بكامل واقعيتك." });
        }

        const response = await fetch(API_URL, {
            headers: { 
                "Authorization": `Bearer ${hf_token}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
                messages: finalMessages, 
                max_tokens: 350, // مساحة ممتازة للتعبير الواقعي والعميق
                temperature: 0.5, // درجة حرارة متزنة تضمن الإبداع الواقعي والالتزام الصارم بالخطوات
                presence_penalty: 0.2,
                frequency_penalty: 0.2
            }),
        });

        const rawResult = await response.text();
        let data;

        try {
            data = JSON.parse(rawResult);
        } catch (jsonErr) {
            return res.status(200).json({ success: false, error: "استجابة غير متوقعة من السيرفر" });
        }

        if (data.choices && data.choices.length > 0) {
            const ai_reply = data.choices[0].message.content.trim();
            return res.status(200).json({ success: true, ai_reply: ai_reply });
        } else {
            return res.status(200).json({ success: false, error: "لم يتم العثور على رد من الموديل الذكي" });
        }

    } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
    }
}
