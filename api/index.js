/**
 * جسر محاكاة المعهد التعليمي الذكي فائق الدقة - Vercel Serverless
 * المبرمج: كامل الروافي
 * التعديل: إصلاح هيكلية تناوب الرسائل المتوافقة مع Llama-3 لتجنب انهيار الموديل
 */

export default async function handler(req, res) {
    // إعدادات الـ CORS الكاملة
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

        const memberName = bodyData?.member_name || "عضو مجهول";
        const memberRole = bodyData?.member_role || "student"; 
        const specialty = bodyData?.specialty || "General";
        const currentLevel = bodyData?.level || 1;
        const currentStatus = bodyData?.status || "Idle";
        
        const fullChatHistory = bodyData?.chat_history || [];
        const activeHumanCommands = bodyData?.active_commands || "لا توجد أوامر علوية معلقة حالياً من المستخدم.";

        const hf_token = "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"; 
        const API_URL = "https://router.huggingface.co/v1/chat/completions";

        let systemPrompt = `أنت في محاكاة واقعية جداً بنسبة 100% لمعهد تعليمي ذكي ومتكامل.
تم تطويرك وبرمجتك بواسطة المبرمج المحترف (كامل الروافي).

تؤدي الآن دور الشخصية التالية بناءً على البيانات الحية:
- الاسم: ${memberName}
- الدور: ${memberRole === 'manager' ? 'المدير العام للمعهد' : memberRole === 'teacher' ? 'المعلم' : 'التلميذ'}
- التخصص/الفصل: ${specialty}
- المستوى الحقيقي الحالي: Level ${currentLevel}
- الحالة الحالية: ${currentStatus}

🛑 بروتوكول التفكير والتحقق الصارم:
الخطوة 1 [تحديد السياق والأوامر العلوية]: اقرأ بتمعن وعمق الأوامر الصادرة من المستخدم الخارجي:
(${activeHumanCommands})
إذا كنت تلعب دور "المدير العام" ولديك أمر موقوت أو فوري، يجب أن تمتص هذا الأمر وتبدأ في تنفيذه داخل المحاكاة فوراً بإصدار توجيهاتك الصارمة لبقية الطاقم.

الخطوة 2 [التثبت والتحقق من الهوية والأدوار]: تذكر هويتك وتاريخك بالكامل في المحادثات السابقة الممررة لك. يمنع منعاً باتاً الخروج عن حدود شخصيتك الحالية.

الخطوة 3 [المطابقة المزدوجة]: حلل ردود بقية الأعضاء السابقة في السجل واصنع رداً تفاعلياً حياً.

🎯 أسلوب الحوار وإخراج الرد:
- تحدث بحرية تامة باللغة أو اللهجة التي تناسب السياق الحالي وبشكل طبيعي، بليغ ومفهوم.
- صغ ردودك في جمل كاملة ومنظمة، وتجنب الردود الآلية أو الروبوتية الجافة.`;

        // 🛠️ إعادة بناء مصفوفة الرسائل لضمان التناوب الصحيح والنظيف لـ Llama-3
        let finalMessages = [];
        
        // 1. إضافة رسالة النظام الحاكمة للمحاكاة
        finalMessages.push({ "role": "system", "content": systemPrompt });

        // 2. فلترة السجل والتأكد من توافق الأدوار وسلاستها
        if (fullChatHistory.length > 0) {
            fullChatHistory.forEach(msg => {
                // التأكد من تحويل مسميات الأدوار غير المدعومة في بعض بروتوكولات الخوادم
                let roleName = msg.role;
                if (roleName === 'assistant' || roleName === 'model') {
                    roleName = 'assistant'; 
                } else {
                    roleName = 'user';
                }
                finalMessages.push({ "role": roleName, "content": msg.content || msg.message_content });
            });
        }

        // 3. تأمين نهاية المصفوفة: يجب أن تنتهي دائماً برسالة من نوع user ليتمكن الموديل من الرد عليها
        if (finalMessages[finalMessages.length - 1].role === 'assistant') {
            finalMessages.push({ 
                "role": "user", 
                "content": "تابع المحاكاة الآن، ما هي خطوتك أو ردك التالي بناءً على الموقف الأخير في المعهد؟" 
            });
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
                max_tokens: 350, 
                temperature: 0.6, 
                presence_penalty: 0.2,
                frequency_penalty: 0.2
            }),
        });

        const rawResult = await response.text();
        let data;

        try {
            data = JSON.parse(rawResult);
        } catch (jsonErr) {
            return res.status(200).json({ success: false, error: "استجابة غير متوقعة من سيرفر المعالجة الخارجي" });
        }

        // تفقد وجود أي رسائل خطأ قادمة من Hugging Face ومشاركتها مع الرادار
        if (data.error) {
            return res.status(200).json({ success: false, error: data.error.message || data.error });
        }

        if (data.choices && data.choices.length > 0) {
            const ai_reply = data.choices[0].message.content.trim();
            return res.status(200).json({ success: true, ai_reply: ai_reply });
        } else {
            return res.status(200).json({ success: false, error: "لم يتم العثور على رد، قد يكون الحساب بحاجة لتحديث الرصيد أو مراجعة المعرف للنموذج" });
        }

    } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
    }
}
