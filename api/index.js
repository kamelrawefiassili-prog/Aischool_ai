/**
 * جسر محاكاة المعهد التعليمي الذكي فائق الدقة - Vercel Serverless
 * المبرمج: كامل الروافي
 * التحديث: دمج الـ Hugging Face Router الجديد والتوكن الحديث المستقر
 */

module.exports = async (req, res) => {
    // 🌍 بروتوكول فتح الحماية الشامل لضمان الاتصال المباشر من الهاتف
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).send("✅ جسر المعهد الذكي مستعد ومحدث بنظام الـ Router الجديد!");
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
        const activeHumanCommands = bodyData?.active_commands || "لا توجد أوامر معلقة.";

        // 🌟 البيانات الجديدة والدقيقة التي زودتني بها
        const hf_token = "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"; 
        const API_URL = "https://router.huggingface.co/v1/chat/completions";

        const systemPrompt = `أنت في محاكاة واقعية جداً بنسبة 100% لمعهد تعليمي ذكي ومتكامل.
تم تطويرك وبرمجتك بواسطة المبرمج المحترف (كامل الروافي).
تؤدي الآن دور الشخصية التالية بناءً على البيانات الحية:
- الاسم: ${memberName}
- الدور: ${memberRole === 'manager' ? 'المدير العام للمعهد' : memberRole === 'teacher' ? 'المعلم' : 'التلميذ'}
- التخصص/الفصل: ${specialty}
- المستوى الحقيقي الحالي: Level ${currentLevel}
- الحالة الحالية: ${currentStatus}

🛑 بروتوكول التفكير والتحقق الصارم:
الخطوة 1: اقرأ بتمعن وعمق الأوامر الصادرة من المستخدم الخارجي: (${activeHumanCommands}) ونفذها إن كانت موجهة لدورك.
الخطوة 2: التزم بحدود شخصيتك الحالية تماماً وعامل البقية وفقاً لأدوارهم في السجل الممرر.
الخطوة 3: تحدث بحرية تامة باللهجة أو اللغة المناسبة للسياق (تونسية، فصحى) بشكل طبيعي وواقعي مكملاً الموقف الأخير العالق.`;

        let finalMessages = [];
        finalMessages.push({ "role": "system", "content": systemPrompt });

        if (fullChatHistory.length > 0) {
            fullChatHistory.forEach(msg => {
                let roleName = msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user';
                finalMessages.push({ "role": roleName, "content": msg.content || "" });
            });
        }

        if (finalMessages[finalMessages.length - 1].role === 'assistant' || finalMessages.length === 1) {
            finalMessages.push({ 
                "role": "user", 
                "content": "تابع دورك اللحظي الآن في المعهد وتفاعل مع الأحداث الحالية بكامل واقعيتك مكملاً الموقف الأخير." 
            });
        }

        // 📡 إرسال الطلب المباشر للموديل عبر الـ Router والمزود المختار
        const response = await fetch(API_URL, {
            headers: { 
                "Authorization": `Bearer ${hf_token}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-8B-Instruct:novita", // السيرفر الموجه الجديد
                messages: finalMessages, 
                max_tokens: 350, 
                temperature: 0.6,
                stream: false
            }),
        });

        const rawResult = await response.text();
        
        if (!rawResult || rawResult.trim() === "") {
            return res.status(200).json({ success: false, error: "الـ Router أرجع استجابة فارغة، تفقد رصيد الحساب." });
        }

        let data;
        try {
            data = JSON.parse(rawResult);
        } catch (jsonErr) {
            return res.status(200).json({ success: false, error: `فشل تحليل الرد الجديد. النص هو: ${rawResult.substring(0, 100)}` });
        }

        if (data.error) {
            return res.status(200).json({ success: false, error: data.error.message || JSON.stringify(data.error) });
        }

        if (data.choices && data.choices.length > 0) {
            const ai_reply = data.choices[0].message.content.trim();
            return res.status(200).json({ success: true, ai_reply: ai_reply });
        } else {
            return res.status(200).json({ success: false, error: `بنية الاستجابة غريبة: ${rawResult.substring(0, 100)}` });
        }

    } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
    }
};
