import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="MediCart AI Health Chatbot Backend",
    description="A responsive Python-based medical assistant backend for MediCart mobile client.",
    version="1.0.0"
)

# Enable CORS for local network and mobile devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

class ChatReply(BaseModel):
    reply: str

# Contextual health advisor logic
def generate_response(user_msg: str) -> str:
    msg = user_msg.lower().strip()
    
    # Greetings
    if any(greet in msg for greet in ["hello", "hi", "hey", "greetings", "hola"]):
        return (
            "👋 **Hello! Welcome to MediCart AI Health Assistant.**\n\n"
            "I'm here to help you search for medicines, guide you on how to use the app, "
            "and answer general health questions.\n\n"
            "💡 *Try asking me about:*\n"
            "• 🤒 \"What should I do for a fever?\"\n"
            "• 🤕 \"Remedies for a severe headache\"\n"
            "• 🛒 \"How do I place an order or add to cart?\"\n"
            "• 💊 \"Search for Paracetamol or Cetirizine\"\n\n"
            "How can I help you today?"
        )
        
    # Help / General Info
    if any(h in msg for h in ["help", "info", "what can you do", "menu", "features"]):
        return (
            "🛠️ **MediCart AI Chatbot Features**\n\n"
            "I can assist you with multiple topics:\n\n"
            "1️⃣ **Common Health Advice:** Ask about symptoms like fever, cold, headache, or stomach ache.\n"
            "2️⃣ **Medicine Guidance:** Inquire about specific medicines like Paracetamol, Combiflam, or Cetirizine.\n"
            "3️⃣ **App Assistance:** Get step-by-step instructions on adding products to the cart, managing addresses, and placing orders.\n\n"
            "⚠️ *Disclaimer:* I am an AI assistant and do not replace professional medical advice. Always consult a certified physician for serious conditions."
        )

    # Fever
    if "fever" in msg or "temperature" in msg or "feverish" in msg:
        return (
            "🤒 **Fever Management & Advice**\n\n"
            "A fever is typically a sign that your body is fighting off an infection. Here is some general advice:\n\n"
            "• 💊 **Common Relief:** Over-the-counter fever reducers such as **Paracetamol** (e.g., Crocin, Dolo 650) or **Combiflam** (Ibuprofen + Paracetamol) are frequently used to lower temperature and relieve body aches.\n"
            "• 💧 **Hydration:** Drink plenty of fluids (water, herbal tea, electrolyte solutions) to prevent dehydration.\n"
            "• 🛌 **Rest:** Allow your body to rest and heal.\n"
            "• ❄️ **Cool Compress:** Place a damp, cool cloth on your forehead to help lower temperature naturally.\n\n"
            "⚠️ *Important Disclaimer:* If your fever is above 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe headache, rash, or breathing difficulties, please consult a healthcare professional immediately."
        )

    # Headache / Pain
    if any(pain in msg for pain in ["headache", "pain", "ache", "migraine", "body pain"]):
        return (
            "🤕 **Pain Relief & Advice**\n\n"
            "For general aches, muscle pain, or mild headaches, here are helpful steps:\n\n"
            "• 💊 **Suggested Medicines:** **Combiflam** (contains Ibuprofen & Paracetamol) is highly effective for reducing pain and inflammation. Alternatively, standard **Paracetamol** provides mild-to-moderate pain relief.\n"
            "• 💧 **Hydrate & Rest:** Dehydration is a common trigger for headaches. Drink a glass of water and rest in a dark, quiet room.\n"
            "• 💆‍♂️ **Massage:** Gently massage your temples or neck muscles if you are experiencing a tension headache.\n\n"
            "⚠️ *Warning:* If you experience a sudden, extremely severe headache ('thunderclap' headache), neck stiffness, confusion, or difficulty speaking, seek emergency medical care immediately."
        )

    # Cold / Cough / Flu
    if any(cold in msg for cold in ["cold", "cough", "flu", "runny nose", "sneeze", "allergy"]):
        return (
            "🤧 **Cold, Cough, & Allergy Relief**\n\n"
            "Colds and coughs are usually viral but can be managed with supportive care:\n\n"
            "• 💊 **Suggested Relief:**\n"
            "  - For runny nose or sneezing: **Cetirizine** is a popular non-drowsy antihistamine.\n"
            "  - For chest congestion: Expectorant cough syrups or warm fluids.\n"
            "• 💨 **Steam Inhalation:** Inhale steam from a hot bowl of water 2-3 times a day to relieve nasal congestion.\n"
            "• 🍵 **Warm Fluids:** Warm water, honey with ginger, and warm broths can soothe an irritated throat.\n\n"
            "⚠️ *Note:* Standard colds resolve in 7-10 days. If you experience shortness of breath, high fever, or your cough lasts longer than 2 weeks, consult a physician."
        )

    # App usage: How to buy/add to cart/place order
    if any(kw in msg for kw in ["cart", "buy", "order", "checkout", "purchase", "place order", "how to"]):
        return (
            "🛒 **How to Order on MediCart:**\n\n"
            "Follow these simple steps to order your medicines:\n\n"
            "1️⃣ **Find Medicines:** Go to the **Medicines** tab on the Home screen. Use the search bar to find what you need (e.g. 'Paracetamol').\n"
            "2️⃣ **Add to Cart:** Tap the green **Add to Cart** button on the medicine card.\n"
            "3️⃣ **Open Cart:** Tap the **Cart** tab in the bottom bar or your Home screen.\n"
            "4️⃣ **Select Address:** Select your delivery address. If you haven't added one, tap **Add Address** and fill out the details.\n"
            "5️⃣ **Place Order:** Tap **Place Order**. You'll see a success screen, and your order will be sent to the backend!\n"
            "6️⃣ **Track Orders:** Go to the **Orders** tab on your Home screen to view your active or past orders."
        )

    # Specific medicine queries
    if "paracetamol" in msg or "dolo" in msg or "crocin" in msg:
        return (
            "💊 **About Paracetamol (Acetaminophen)**\n\n"
            "Paracetamol is a widely used over-the-counter medicine designed to reduce fever and treat mild-to-moderate pain.\n\n"
            "• **Uses:** Fever, tension headaches, toothache, mild arthritis, muscle strain.\n"
            "• **Availability:** You can search for 'Paracetamol' or 'Combiflam' on the Medicines screen to add it to your order.\n"
            "• **Safety Tip:** Avoid taking more than 4,000 mg in a single 24-hour period. Excess dosages can cause severe liver damage.\n"
            "• **Requires Prescription:** No, it is generally an OTC (Over-The-Counter) drug."
        )
        
    if "combiflam" in msg or "ibuprofen" in msg:
        return (
            "💊 **About Combiflam**\n\n"
            "Combiflam is a combination drug containing **Ibuprofen (400mg)** and **Paracetamol (325mg)**.\n\n"
            "• **Uses:** Highly effective for painful inflammatory conditions like muscular pain, backache, joint pain, and fever.\n"
            "• **How it works:** Ibuprofen reduces inflammation/swelling, while Paracetamol blocks pain signals and lowers fever.\n"
            "• **Availability:** Search for 'Combiflam' on the Medicines screen to buy it.\n"
            "• **Precautions:** Best taken with food or milk to avoid stomach irritation."
        )

    if "cetirizine" in msg or "okacet" in msg or "allergy pill" in msg:
        return (
            "💊 **About Cetirizine**\n\n"
            "Cetirizine is a second-generation antihistamine used to relieve allergy symptoms.\n\n"
            "• **Uses:** Running nose, sneezing, itchy/watery eyes, hives, allergic skin reactions.\n"
            "• **Benefits:** It is long-acting (24 hours) and generally causes much less drowsiness than older antihistamines.\n"
            "• **Availability:** Search for 'Cetirizine' on the Medicines screen to purchase."
        )

    # Default fallback
    return (
        "🤖 **I'm listening and here to help!**\n\n"
        "I recognized your query, but I want to make sure I give you the most accurate advice. "
        "Could you please specify if you are asking about:\n\n"
        "• A particular symptom (e.g. fever, headache, cold)\n"
        "• A specific medicine (e.g. Paracetamol, Combiflam, Cetirizine)\n"
        "• Using the app (e.g. adding to cart, placing an order, addresses)\n\n"
        "If this is a medical emergency, please call your local healthcare services immediately."
    )

@app.post("/api/chat", response_model=ChatReply)
async def chat_endpoint(request: ChatMessage):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    reply_text = generate_response(request.message)
    return ChatReply(reply=reply_text)

if __name__ == "__main__":
    import uvicorn
    # Listen on all interfaces (0.0.0.0) so clients on the same Wi-Fi can connect
    uvicorn.run("main:app", host="0.0.0.0", port=5005, reload=True)
