/**
 * جسر محاكاة المعهد التعليمي الذكي فائق الدقة - Vercel Serverless
 * المبرمج: كامل الروافي
 * التحديث: تفعيل آلية التثبت المنطقي المزدوج لربط نظام الإدارة، الأساتذة، والتلاميذ
 */

export default async function handler(req, res) {
    // إعدادات الـ CORS الكاملة لتأمين الاتصال من أي هاتف أو استضافة
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).send("✅ جسر محاكاة المعهد يعمل بنظام التثبت المنطقي والمطابقة المزدوجة والمستقرة 100%!");
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

        // استقبال البيانات الشاملة الممررة من صفحة المعهد (index.php)
        const memberName = bodyData?.member_name || "عضو مجهول";
        const memberRole = bodyData?.member_role || "student"; // manager, teacher, student
        const specialty = bodyData?.specialty || "General";
        const currentLevel = bodyData?.level || 1;
        const currentStatus = bodyData?.status || "Idle";
        
        // سجل المحادثات الكامل القادم من قاعدة بيانات Awardspace
        const fullChatHistory = bodyData?.chat_history || [];
        
        // الأوامر الصادرة منك كمتحكم بالنظام
        const activeHumanCommands = bodyData?.active_commands || "لا توجد أوامر علوية معلقة حالياً من المستخدم.";

        // التوكن الجديد المحدث والرابط الأصيل المجاني لمنع انهيار المصادقة
        const hf_token = "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"; 
        const API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions";

        // 🧠 الـ System Prompt المطور للمعهد التعليمي بنظام التحقق الصارم
        const systemPrompt = `أنت في محاكاة واقعية جداً بنسبة 100% لمعهد تعليمي ذكي ومتكامل.
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
إذا كنت تلعب دور "المدير العام" ولديك أمر موقوت أو فوري (مثل تفقد المعهد أو زيارة الفصول)، يجب أن تمتص هذا الأمر وتبدأ في تنفيذه داخل المحاكاة فوراً بإصدار توجيهاتك الصارمة لبقية الطاقم دون نسيان.

الخطوة 2 [التثبت والتحقق من الهوية والأدوار]: تذكر هويتك وتاريخك بالكامل في المحادثات السابقة الممررة لك. يمنع منعاً باتاً الخروج عن حدود شخصيتك الحالية (المعلم لا يتصرف كمدير، والتلميذ يلتزم بحدود الأدب والاستعداد للفصل والامتحان).

الخطوة 3 [المطابقة المزدوجة]: حلل ردود بقية الأعضاء السابقة في السجل. أجب بأسلوب يحاكي الواقع تماماً؛ إذا أعلن المدير عن تفتيش، يظهر المعلم احترامه ويوجه تلاميذه، ويظهر التلميذ انضباطه أو توتره الواقعي من الامتحانات.

🎯 أسلوب الحوار وإخراج الرد:
- تحدث بحرية تامة باللغة أو اللهجة التي تناسب السياق الحالي (عربية فصحى، دارجة، إلخ) وبشكل طبيعي، بليغ ومفهوم.
- صغ ردودك في جمل كاملة ومنظمة، وتجنب الردود الآلية أو الروبوتية الجافة.`;

        // 🛠️ إعادة بناء مصفوفة الرسائل لضمان التناوب السليم المتوافق مع Llama-3
        let finalMessages = [];
        
        // 1. حقن رسالة النظام الحاكمة للمحاكاة
        finalMessages.push({ "role": "system", "content": systemPrompt });

        // 2. تصفية وتجهيز السجل الممرر
        if (fullChatHistory.length > 0) {
            fullChatHistory.forEach(msg => {
                let roleName = msg.role;
                if (roleName === 'assistant' || roleName === 'model') {
                    roleName = 'assistant';
                } else {
                    roleName = 'user';
                }
                finalMessages.push({ "role": roleName, "content": msg.content || "" });
            });
        }

        // 3. تأمين ختام المصفوفة دائماً برسالة من نوع user لكي يتمكن الموديل من معالجتها وإصدار رد
        if (finalMessages[finalMessages.length - 1].role === 'assistant' || finalMessages.length === 1) {
            finalMessages.push({ 
                "role": "user", 
                "content": "تابع دورك اللحظي الآن في المعهد وتفاعل مع الأحداث الحالية بكامل واقعيتك مكملاً الموقف الأخير." 
            });
        }

        // إرسال الطلب المباشر للموديل
        const response = await fetch(API_URL, {
            headers: { 
                "Authorization": `Bearer ${hf_token}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: finalMessages, 
                max_tokens: 350, // مساحة ممتازة للتعبير الواقعي والعميق داخل فصول المعهد
                temperature: 0.6, // توازن بين
