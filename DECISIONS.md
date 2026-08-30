1. What you deliberately did not build, and why? 

Answer: I did not build a full rag pipeline for this assessment, I chose a simpler deterministic retrieval approach because the knowledge base is small.

I deliberately didn't build the identity system because implementing real university identity or an individual student's verification over email or university portal is a substantial separate problem. 

Did not add the staff authentication as well, due to same reason as student's missing identification. Also then we'd have to implement a feature to actually add/create staff and verify them which is important but isn't the core focus.

Left streaming of response because it carried the most complexity for the least correctness gain. Also because the triage first flow means that the reply can only start after the model's decision, and the side effects(persisting the message, openening a case) are done, so streaming would have meant reworking the response inot a stream plus the client reader.

I did not implement a queue system where student's request first go to a queue and a separate worker or process works on that. Because at this scale adding a queue and worker would be overengineering. 


2. One decision where a reasonable engineer would have chosen differently.

Ans:
The decision: the escalation, manipulation, and out-of-scope replies are composed from fixed, hard coded templates in code. Only the handle_now answer is written by the LLM.

Its alternative would have been to let the model generate those messages too, so every reply including an escalation is warm/personalized to the student's exact situation. 

It definitely would have brought less processed experience, which matters a lot when someone is being escalated in distress. 

It would have cost: A second api call on the safety critical path and non determinism where you can least afford it. An escalation reply must reliably tell all the student a person will follow up and surface 999 and Samaritans where there is danger. So the templates buys the guaranteed, correct at the cost of warmth and personalization. 

I found out that even after such stric prompt, guidelines and house rules, model generated a phone-no, email and gave information about third party orgs which weren't in the knowledge base, keeping these things in mind, model's response cannot be fully trusted, hence templates for safety.


3. What breaks first?

Ans: the very first thing thats gonna break would be AI layer under rate limits. Groq's free tier throttles fast (I saw this in testing), so triage calls start failing and the code falls back to escalate. That is safe, but at real volume it quietly fills the staff queue with routine cases and buries the urgent ones, the opposite of the product's goal. I would catch it early because every triage row already records usedFallback and its disposition, so I would monitor the fallback and escalation rates and alert when either rises above baseline, rather than waiting for a student to complain.