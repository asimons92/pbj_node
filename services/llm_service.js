const { OpenAI } = require('openai');
const z = require('zod'); // Zod for schema validation
const { BEHAVIOR_RECORD_TOOL } = require('../utils/llmTools');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// define zod schema

const LlmOutputSchema = z.object({
    records: z.array(z.object({
        student_name: z.string().min(1),
        student_id: z.string().optional(),
        recording_timestamp: z.string(),
        behavior_date: z.string().optional(),
        source: z.string().optional(),
        behavior: z.object({
            category: z.enum([
                "off-task", "disruption", "non-participation", "tardy", "absence",
                "peer-disruption", "technology-violation", "prosocial", "defiance",
                "aggression", "self-management", "respect", "other"
            ]),
            description: z.string().min(1),
            severity: z.enum(['low','moderate','high']),
            is_positive: z.boolean(),
            needs_followup: z.boolean(),
            tags: z.array(z.string())
        }),
        context: z.object({
            class_name: z.string().optional(),
            teacher: z.string().optional(),
            activity: z.string().optional(),
            group_ids: z.array(z.string()).optional(),
            location: z.string().optional()
        }).optional(),
        intervention: z.object({
            status: z.enum(["none", "recommended", "in_progress", "completed"]).optional(),
            type: z.string().optional(),
            notes: z.string().optional(),
            tier: z.enum(["universal", "tier_1", "tier_2", "tier_3"]).optional()
        }).optional()
    }))
})



async function callOpenAIApi(notes) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use a model capable of tool calling
            messages: [
                {
                    role: "system",
                    content: `You are a specialized assistant that extracts structured student behavior records from unstructured teacher notes. 
You must always use the \`parse_behavior_record\` tool. 
You are a high school behavior specialist familiar with PBIS, MTS, and other behavior intervention programs.
If there are multiple students mentioned in a note, the data returned should be an array of objects, one for each student mentioned. 
Note that the severity and intervention requirements should be in line with a high school environment. Please do not return any other information than the behavior record.
Always include the severity and intervention requirements in the behavior record.
Always include the tags in the behavior record.
Always include the description in the behavior record.
Always include the category in the behavior record.
Always include the is_positive in the behavior record.
Always include the needs_followup in the behavior record.
Always include the student_name in the behavior record.
Always include the student_id in the behavior record.
Always include the recording_timestamp in the behavior record.
If the behavior_date is not explicitly mentioned in the note, use the recording_timestamp as the behavior_date.
Do not ever guess student_name or class_name, if this information is not explicitly mentioned in the note just return an empty string.` 
                },
                {
                    role: "user",
                    content: `Please process the following teacher note: "${notes}"`
                }
            ],
            tools: [BEHAVIOR_RECORD_TOOL], // Your tool definition
            tool_choice: { type: "function", function: { name: "parse_behavior_record" } },
        });
        const toolCall = response.choices[0].message.tool_calls[0];
        if (!toolCall || toolCall.function.name !== "parse_behavior_record") {
            throw new Error("LLM did not return a valid tool call for parsing.");
        }
        const jsonArgs = JSON.parse(toolCall.function.arguments);

        const validatedData = LlmOutputSchema.parse(jsonArgs);

        return validatedData;
    } catch (error) {
        console.error("LLM Service Error during API call or validation:", error.message);
        // Re-throw the error so the controller can catch it and send a 500 response
        throw new Error(`LLM processing failed: ${error.message}`);
    }};


module.exports = { callLlmApi: callOpenAIApi };