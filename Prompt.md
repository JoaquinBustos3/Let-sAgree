# 🤖 AI Prompt Guidelines Let'sAgree

## 📌 Objective
Generate clean, maintainable, and human-readable code that adheres to standardized naming conventions and organizational patterns across a full-stack JavaScript application using:

- **Frontend**: React (JSX, functional components, hooks)
- **AI Layer**: Express.js (REST API, middleware), Express endpoints handling AI interactions

---

## 🧠 Naming Conventions

Follow these naming conventions for **all code**, across frontend and backend:

---

## 🧠 Naming Conventions:
- **Variables**: Use `camelCase` for all variables and function names.
- **Constants**: Use `UPPER_SNAKE_CASE` for constants (e.g., `DEFAULT_LIMIT`)
- **Classes**: Use `PascalCase` for class names.
- **Files**: Use `kebab-case` for filenames (e.g., `note-controller.js`)

---

## 📝 Project: Let'sAgree

**Let’sAgree** is a fast-paced, fun web app designed for couples, partners, or friends (with future group support). It helps users find agreement on a topic (e.g., what to eat, what to watch) through a decision-making game that combines generative AI and user interaction.

---

### 🔄 App Flow

1. Open the landing screen
2. Display app description, available categories, and upcoming updates
3. Upon category selection:
   - Show a helpful prompt box with input instructions
   - (Future) Offer game mode selection
4. AI generates a **maximum of 15 Cards** based on user input and category data model
5. **Turn-based interaction**:
   - User 1 accepts/denies cards
   - Reset for User 2 to do the same
6. After Round 1:
   - Users can continue filtering, or spin a **random wheel** to choose a remaining card
7. Repeat rounds until:
   - 1 card remains **or**
   - User taps “We Choose This One”
8. Display a final message with a short animation and return to the main screen

---

### 🛠 MVP Functionalities

- Predefined categories (e.g., restaurants, movies, indoor dates) with strict data models
- Preprocessing: Clean user input using a `Prompt` data model before sending to AI
- Postprocessing: Parse and validate AI output, retry if invalid, apply fallback logic
- Turn-based card filtering: accept/deny logic across users
- “Spin the wheel” feature to randomly choose a card from accepted ones
- “Need Help Choosing?” feature with a prewritten description to entice the user
- Final animation with celebratory message and prewritten description
- Timer feature to limit time per decision

---

### 🚀 Future Features

- **Synchronous swiping** with partner via invitation
- **Dynamic data models** based on user-defined categories
- **Saved card sets** (community + personal)
- **Edit card sets** instead of regenerating
- **Conversation memory** for context-aware play

---

### 🎮 Game Modes

- **Mystery Box**
  - Abstract category generation (e.g., “cheap eats”, “romantic”)
  - Users agree based on vibe/feeling

- **Pick 2**
  - Show 3 cards, pick 2 → Repeat across rounds until 2 cards remain
  - Ends with couple's discussion or random wheel

- **Gut Check**
  - Each card shown briefly
  - Users must make fast gut decisions
  - Time constraint adds pressure

---

### ⚙️ App Architecture

- **Client (React)**
  - Handle user input and timers
  - Display cards and descriptions
  - Manage accept/deny logic
  - Animate final selection

- **AI Request Layer (Express)**
  - Preprocess prompts
  - Send requests to AI
  - Postprocess responses and validate against schemas

- **Server (Express)** (Optional for MVP)
  - Could manage user sessions, multiplayer sync, saved sets, etc.

---

### 🎨 Theme & Style Ideas

- Crystal Ball aesthetic
- Magic + Mystery: Cards, Hats, Animated Effects
