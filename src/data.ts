// Everything a client reads lives here. Edit text, links and order in this file.

export const site = {
  brand: "Yll Visuals",
  name: "Yll Mehmeti",
  role: "Video editor & motion designer",
  experience: "5+ years",
  location: "Kosovo",
  // Empty values hide the button.
  contact: {
    email: "yllmehmeti841@gmail.com",
    whatsapp: "",       // international format, digits only, e.g. "38344123456"
    instagram: "",      // handle without @
  },
};

export type Aspect = "9x16" | "4x5" | "16x9";

export type Project = {
  id: string;          // file name in public/media (without extension)
  aspect: Aspect;
  title: string;
  client: string;
  tags: string[];
  problem: string;
  idea: string;
  how: string;
  result?: string;     // real outcome only (views, bookings, client words). Hidden when empty.
  wide?: boolean;      // landscape layout
};

export const projects: Project[] = [
  {
    id: "coming-to-iphone-9x16", aspect: "9x16", title: "Coming to iPhone", client: "Clarity Scheduling",
    tags: ["Launch film", "9:16 + 4:5", "24 s"],
    problem: "Announce the iOS launch and explain the whole app in one short, calm video, with no voiceover.",
    idea: "One shape stays in the centre and morphs through every step: service, team member, day, time, confirm, hours, Google Calendar. Then Android flips to iPhone.",
    how: "Apple-style easing (fast start, long settle), words sliding in, every move cut to the beat, real motion blur.",
  },
  {
    id: "move-it-9x16", aspect: "9x16", title: "Move it", client: "Clarity Scheduling",
    tags: ["Feature reel", "9:16", "20 s"],
    problem: "Clients cancel when they could just reschedule.",
    idea: "“Can't make your appointment? Don't cancel. Move it.” One card morphs through the real reschedule flow until the barber confirms.",
    how: "UI rebuilt from the app's real screenshots, a single-shape morph, AI voice, beat-timed foley.",
  },
  {
    id: "nothing-to-download-9x16", aspect: "9x16", title: "Nothing to download", client: "Clarity Scheduling",
    tags: ["Reel", "9:16 + 4:5", "19 s"],
    problem: "Clients don't want to install an app just to book a haircut.",
    idea: "One link. Book in the browser. The barber confirms in seconds.",
    how: "The booking pages lie on a desk while a 2.5D camera glides over them and drops into “Booking request sent”. AI voice. Also cut in 4:5 for Reddit.",
  },
  {
    id: "noshow-9x16-blur", aspect: "9x16", title: "No-show", client: "Clarity Scheduling",
    tags: ["Reel", "9:16", "22 s"],
    problem: "No-shows cost small businesses real money.",
    idea: "A money-first story on dark navy, with no booking flow at all. A different angle from the rest.",
    how: "Kinetic type, an odometer counter, heavy motion blur.",
  },
  {
    id: "one-link-16x9", aspect: "16x9", title: "One link", client: "Clarity Scheduling", wide: true,
    tags: ["Ad", "16:9", "20 s"],
    problem: "Bookings are scattered across DMs, calls and notes.",
    idea: "One booking link replaces all of it.",
    how: "Motion UI built from the app's real screenshots, composed for landscape.",
  },
  {
    id: "expert-pro-sef-v4-9x16", aspect: "9x16", title: "Expert Pro: SEF", client: "Expert Pro · client",
    tags: ["Explainer", "Albanian", "9:16", "20 s"],
    problem: "Explain Kosovo's new fiscal e-invoicing (SEF) simply, in Albanian.",
    idea: "“Një shitje, një formë.” One teal shape carries a sale from start to finish, with short punchlines.",
    how: "Desktop UI rebuilt from the real program, 60 fps, cuts on the music's bars.",
  },
];

export const moreWork = [
  { id: "busy-hands-9x16-v1", title: "Busy hands", line: "The barber is mid-cut; Clarity books the client anyway." },
  { id: "barber-hears-9x16-v3", title: "Barber hears", line: "Kinetic type built around what a barber hears all day." },
  { id: "calendar-tetris-9x16", title: "Calendar Tetris", line: "Bookings fall into the week like Tetris blocks." },
  { id: "clarity-explainer-9x16-v2", title: "Clarity explainer", line: "A full app explainer, approved frame by frame." },
];

// Earlier edits: originals from Yll's Cloudinary, compressed into public/media as edit-<file>.mp4/.jpg.
export const editCategories = ["Car edits", "Music edits", "Motion graphics", "Edits"] as const;
export type EditCategory = (typeof editCategories)[number];
export type Edit = { file: string; title: string; category: EditCategory; aspect: Aspect; src: string; poster: string };

const edit = (file: string, title: string, category: EditCategory, aspect: Aspect = "9x16"): Edit => ({
  file, title, category, aspect,
  src: `/media/edit-${file}.mp4`,
  poster: `/media/edit-${file}.jpg`,
});

export const edits: Edit[] = [
  edit("Porsche_Duo", "Porsche Duo", "Car edits"),
  edit("M4_G82_Edit", "BMW M4 G82", "Car edits"),
  edit("Auudi_Fe_Prob4", "Audi", "Car edits"),
  edit("Porscscs_Iris2", "Porsche Iris", "Car edits"),
  edit("550I_1", "BMW 550i", "Car edits"),
  edit("bmw_6", "BMW 6", "Car edits"),
  edit("Porsche", "Porsche", "Car edits"),
  edit("Montagem", "Montagem", "Music edits"),
  edit("Brisa_Te_Levar", "Brisa Te Levar", "Music edits"),
  edit("Ruptura", "Ruptura", "Music edits"),
  edit("Devloom_Logo_Animation", "Devloom logo animation", "Motion graphics", "16x9"),
  edit("Nisi_Final", "Nisi", "Edits"),
  edit("Clarity_Final", "Clarity", "Edits", "16x9"),
  edit("Klodiii", "Klodi", "Edits"),
  edit("gjak0ve", "Gjakova", "Edits"),
  edit("Img_4917_1_Prob4", "Street scene", "Edits", "16x9"),
];

// Ads and posters made with AI. Put files in public/media/ai/ and list them here.
// The section stays hidden while this list is empty.
export type AIWork =
  | { kind: "image"; file: string; title: string }                 // e.g. "forever-poster.jpg"
  | { kind: "video"; file: string; title: string; aspect: Aspect }; // e.g. "tirongoods-ad" (.mp4 + .jpg poster)

export const aiWork: AIWork[] = [];

// Book-a-call form options
export const industries = ["App / SaaS", "Barber & beauty", "Restaurant & café", "Shop / e-commerce", "Real estate", "Cars", "Other"];
export const needs = ["Launch film", "Feature reel", "Ad", "Explainer", "Social edits", "Not sure yet"];
export const callOptions = ["Google Meet", "WhatsApp call", "Zoom"];

export const steps = [
  { title: "Brief → script → storyboard", text: "Every frame planned and approved before building." },
  { title: "Your real UI, rebuilt", text: "Rebuilt in code from your screenshots, so it can morph smoothly." },
  { title: "Motion", text: "One hero in the centre, easing with contrast, real holds, every cut on the beat." },
  { title: "Sound", text: "Voiceover when needed, foley-style SFX, music mixed under them." },
  { title: "Finish", text: "Real motion blur, social loudness, and a version for every format." },
];
