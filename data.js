const EX = [
  { id: "glute_bridge", name: "Glute bridge", img: "bridge", cues: ["Feet flat, hip-width, heels about a hand's length from your bottom", "Breathe out, squeeze your bottom and lift until shoulders, hips and knees line up", "Stop before your lower back arches; pause 2 s, lower slowly"], easier: "Smaller lift, or hold the top for 3 s instead of doing more reps.", videos: [{ title: "How to do a glute bridge (physical therapists)", site: "Hinge Health", id: "PhTDzR0TpZs" }] },
  { id: "hip_thrust", name: "Hip thrust, shoulders on the sofa", img: "thrust", cues: ["Shoulder blades on the sofa edge, dumbbell on a folded towel over your hips", "Chin tucked, ribs down; drive through your heels", "Shins vertical at the top, no back arch"], easier: "Go back to the floor glute bridge with the dumbbell on your hips.", videos: [{ title: "Dumbbell hip thrust, full tutorial", site: "J2FIT Strength & Conditioning", id: "29OfN4ztW_g" }] },
  { id: "bb_bridge", name: "Barbell glute bridge", cues: ["Roll the bar over your legs to your hip crease; pad it with a folded towel", "Same setup as the glute bridge, hands steady the bar", "Lift to a straight line, pause, lower with control"], easier: "Dumbbell hip thrust or glute bridge with lighter load.", videos: [{ title: "How to do a barbell glute bridge", site: "PureGym", id: "DQv1IMQDbE4" }] },
  { id: "hip_hinge", name: "Hip hinge drill with a broom handle", cues: ["Broom along your back touching head, upper back and tailbone", "Soft knees, push your hips back as if closing a car door with your bottom", "Keep all three contact points as you lean forward; stand by squeezing your glutes"], easier: "Stand a foot from a wall and reach your bottom back to touch it.", videos: [{ title: "How to do a hip hinge (physical therapists)", site: "Hinge Health", id: "2W_gXhut5S8" }] },
  { id: "kb_deadlift", name: "Kettlebell deadlift from a raised block", cues: ["Kettlebell between your feet on a step or two thick books", "Hinge back, grip the handle, shoulders over the bell, back flat", "Push the floor away and stand tall; no leaning back at the top"], easier: "Raise the kettlebell higher so you hinge less.", flag: "This is the safe way to learn lifting from low down; heavy barbell deadlifts from the floor stay off the plan.", videos: [{ title: "How to kettlebell deadlift, for beginners", site: "The Durable Body", id: "PrELOSH4E5s" }] },
  { id: "kb_rdl", name: "Kettlebell Romanian deadlift", img: "rdl", cues: ["Start standing tall holding the kettlebell", "Soft knees, slide the bell down your thighs by pushing your hips back", "Stop when your hamstrings are tight or the bell is just below the knee; back stays flat"], easier: "Shorter range (to mid-thigh) or go back to the raised-block deadlift.", videos: [{ title: "How to: kettlebell Romanian deadlift", site: "Of The Lion Fitness", id: "Uc5rP5xs7qQ" }] },
  { id: "bb_rdl", name: "Barbell Romanian deadlift (weeks 9 to 12, light)", cues: ["Get the bar to standing by lifting it from blocks or a step, not a deep floor pull", "Bar stays in contact with your thighs as your hips go back", "Lower only as far as your back stays flat, usually just below the knee"], easier: "Kettlebell RDL. Swap straight back to it if your back niggles.", flag: "Only add this if the kettlebell RDL felt 0 to 3 out of 10 for the back through weeks 5 to 8.", videos: [{ title: "Romanian deadlift", site: "Nuffield Health", id: "7j-2w4-P14I" }] },
  { id: "sit_to_box", name: "Sit-to-box (chair squat)", cues: ["Sturdy dining chair behind you, feet hip-width", "Reach your bottom back and touch the seat lightly, do not flop", "Stand by pushing through the whole foot, knees in line with toes"], easier: "Higher seat (add a cushion) or use your hands on your thighs.", videos: [{ title: "How to do a sit to stand (physical therapists)", site: "Hinge Health", id: "qveKmiXEkIQ" }] },
  { id: "goblet_box", name: "Goblet squat to a box", img: "squat", cues: ["Hold a dumbbell or kettlebell at your chest, elbows tucked", "Sit back to touch the box or chair, chest up, heels down", "Knees follow your toes; drive up without bouncing"], easier: "Higher box, lighter weight, or bodyweight sit-to-box.", videos: [{ title: "Box goblet squat", site: "OPEX Fitness", id: "uzjfcTvgpoc" }] },
  { id: "goblet_squat", name: "Goblet squat to a comfortable depth", cues: ["Same as the box version, without the box", "Go only as deep as your knees and back stay comfortable", "Pause briefly at the bottom, then stand"], easier: "Put the box back in.", videos: [{ title: "How to perform a kettlebell squat", site: "Nuffield Health", id: "deJb-jp8rDo" }] },
  { id: "reverse_lunge", name: "Reverse lunge with limited depth", img: "lunge", cues: ["Hold a chair back for balance; step one foot back", "Lower until the back knee is a few centimetres above a folded cushion", "Front shin stays fairly upright; push through the front heel to return"], easier: "Shorter step and shallower drop, or a static split squat holding the chair.", flag: "Deep, heavily loaded lunges are not in this plan.", videos: [{ title: "How to do a reverse lunge (physical therapists)", site: "Hinge Health", id: "6rKA_et3dGk" }] },
  { id: "step_up", name: "Step-up onto the bottom stair", cues: ["Whole foot on the step, hand on the banister", "Lean slightly forward and push through the top leg, not the back foot", "Step down slowly with control"], easier: "Lower step, or slower reps without weights.", videos: [{ title: "Step up exercise", site: "Cornerstone Physiotherapy", id: "wfhXnLILqdk" }] },
  { id: "incline_pushup", name: "Incline push-up", cues: ["Hands on the kitchen worktop, body in a straight line", "Lower your chest towards the edge, elbows about 45 degrees from your body", "Push away; lower the hand height (sofa arm, step, floor) as you get stronger"], easier: "Wall push-up.", videos: [{ title: "How to do wall push-ups (physical therapists)", site: "Hinge Health", id: "wIPJvBQs7RA" }, { title: "How to do push-ups (physical therapists)", site: "Hinge Health", id: "ZR1QBUtC1GY" }] },
  { id: "db_floor_press", name: "Dumbbell floor press", img: "press", cues: ["Lie on your back, knees bent, dumbbells over your chest", "Lower until your upper arms rest on the floor, elbows about 45 degrees", "Press up without arching your lower back"], easier: "Lighter dumbbells or one arm at a time.", videos: [{ title: "Dumbbell floor press", site: "Perno Performance", id: "lNdi7VEf2Ew" }] },
  { id: "bb_floor_press", name: "Barbell floor press", cues: ["Roll the bar up over your legs or have someone hand it to you; start with the empty bar", "Grip just wider than shoulders, lower until your triceps touch the floor", "Pause, press up; feet flat, back neutral"], easier: "Dumbbell floor press.", videos: [{ title: "How to do the barbell floor press", site: "Men's Health", id: "Izkam7-uklQ" }] },
  { id: "db_row", name: "Supported one-arm dumbbell row", img: "row", cues: ["One hand on a sturdy chair seat or worktop, staggered stance", "Back flat, pull the dumbbell to your hip", "Lower slowly; no twisting through the trunk"], easier: "Higher support (worktop) so you hinge less, or a lighter dumbbell.", videos: [{ title: "Single arm dumbbell row", site: "Nuffield Health", id: "6KNmHxw-SpE" }] },
  { id: "hk_press", name: "Half-kneeling dumbbell press", cues: ["Kneel on a cushion, the other foot forward, squeeze the glute of the down leg", "Press the dumbbell overhead on the side of the down knee", "Ribs down, no leaning back"], easier: "Seated on a chair with your back supported, lighter dumbbell.", videos: [{ title: "Half kneeling dumbbell press", site: "Functional Bodybuilding", id: "-7zgcCU2kW4" }] },
  { id: "dead_bug", name: "Dead bug", img: "deadbug", cues: ["On your back, arms up, hips and knees at 90 degrees", "Gently press your lower back into the floor and breathe out", "Reach one arm back and the opposite leg out, slowly, then swap"], easier: "Move only the legs, or tap a heel to the floor instead of straightening.", videos: [{ title: "How to do a dead bug (physical therapists)", site: "Hinge Health", id: "GbSC02oU3To" }] },
  { id: "bird_dog", name: "Bird dog", img: "birddog", cues: ["Hands under shoulders, knees under hips, back flat", "Reach one arm and the opposite leg out, hold 5 to 10 s", "Imagine a cup of tea on your lower back that must not spill"], easier: "Move just the arm or just the leg.", videos: [{ title: "How to do the bird dog (physical therapists)", site: "Hinge Health", id: "xEDnlOxeJH4" }] },
  { id: "curl_up", name: "McGill curl-up", cues: ["On your back, one knee bent, one leg straight, hands under your lower back", "Brace gently and lift only your head and shoulders a few centimetres", "Hold 8 to 10 s, breathing; no chin poking"], easier: "Shorter holds (5 s) and fewer reps.", flag: "Use this instead of sit-ups or crunches.", videos: [{ title: "McGill curl-up", site: "Zack Henderson", id: "A7HH8DivGB0" }, { title: "The 3 best core exercises (McGill Big 3)", site: "Squat University", id: "2_e4I-brfqs" }] },
  { id: "side_plank", name: "Side plank", cues: ["Elbow under shoulder, knees bent to start", "Lift your hips so you form a straight line", "Hold and breathe; progress to straight legs when easy"], easier: "Shorter holds, or lean against a wall in a standing side plank.", videos: [{ title: "How to do a side plank (physical therapists)", site: "Hinge Health", id: "qbuqsJ9CuQA" }] },
  { id: "farmer", name: "Farmer's carry", img: "carry", cues: ["Pick up the weights with a hip hinge, not a round back", "Stand tall, shoulders back and down, walk with short steady steps", "Put them down the same way you picked them up"], easier: "Lighter weights or shorter distance.", videos: [{ title: "How to perform the farmer's carry", site: "Dr Carl Baird", id: "z7E_YU9P1jU" }] },
  { id: "suitcase", name: "Suitcase carry (one side)", cues: ["Weight in one hand only", "Stay perfectly upright; do not lean away from the weight", "Walk, then swap hands"], easier: "Lighter weight, shorter walk.", videos: [{ title: "How to perform the suitcase carry", site: "Dr Carl Baird", id: "y-hn_Ha1-RE" }] },
  { id: "calf_raise", name: "Calf raise", cues: ["Hold a worktop for balance", "Rise onto the balls of your feet, pause, lower slowly", "Progress to holding a dumbbell or one leg at a time"], easier: "Seated calf raise.", videos: [{ title: "How to do calf raises (physical therapists)", site: "Hinge Health", id: "Mjkh9vBfm_E" }] },
];

const EXMAP = {};
EX.forEach((e) => { EXMAP[e.id] = e; });


const PHASES = [
  { key: "f", label: "Foundation, weeks 1 to 4", weeks: "1-4", days: [
    { name: "Day A (Monday)", items: [
      { ex: "glute_bridge", sets: "3 × 12", rest: "45 s", note: "Bodyweight; dumbbell on hips from week 3" },
      { ex: "sit_to_box", sets: "3 × 10", rest: "60 s", note: "Bodyweight weeks 1 to 2, then hold a light dumbbell" },
      { ex: "incline_pushup", sets: "3 × 8 to 12", rest: "60 s", note: "Hands on the worktop" },
      { ex: "db_row", sets: "3 × 10 each side", rest: "60 s", note: "Hand on a chair seat" },
      { ex: "dead_bug", sets: "2 × 6 each side", rest: "45 s", note: "Slow, breathe out as you reach" },
      { ex: "farmer", sets: "3 × 30 m", rest: "60 s", note: "Hallway or garden" },
    ] },
    { name: "Day B (Wednesday)", items: [
      { ex: "hip_hinge", sets: "2 × 10", rest: "30 s", note: "Learn the pattern first" },
      { ex: "kb_deadlift", sets: "3 × 8", rest: "90 s", note: "Bell on a step or books" },
      { ex: "step_up", sets: "2 × 8 each side", rest: "60 s", note: "Bottom stair, hold the banister" },
      { ex: "db_floor_press", sets: "3 × 10", rest: "60 to 90 s", note: "" },
      { ex: "hk_press", sets: "2 × 8 each side", rest: "60 s", note: "Cushion under the knee" },
      { ex: "bird_dog", sets: "2 × 6 each side", rest: "45 s", note: "5 s hold each rep" },
    ] },
    { name: "Day C (Friday)", items: [
      { ex: "glute_bridge", sets: "3 × 12", rest: "45 s", note: "2 s pause at the top" },
      { ex: "goblet_box", sets: "3 × 10", rest: "60 to 90 s", note: "Box height you can sit to pain-free" },
      { ex: "db_floor_press", sets: "3 × 10", rest: "60 s", note: "" },
      { ex: "db_row", sets: "3 × 12 each side", rest: "60 s", note: "" },
      { ex: "curl_up", sets: "2 × 5 holds of 8 s", rest: "30 s", note: "Swap legs halfway" },
      { ex: "side_plank", sets: "2 × 15 to 20 s each side", rest: "30 s", note: "From the knees" },
      { ex: "calf_raise", sets: "2 × 15", rest: "30 s", note: "" },
    ] },
  ] },
  { key: "b", label: "Build, weeks 5 to 8", weeks: "5-8", days: [
    { name: "Day A (Monday)", items: [
      { ex: "hip_thrust", sets: "3 × 10 to 12", rest: "90 s", note: "Shoulders on the sofa edge" },
      { ex: "goblet_box", sets: "3 × 8 to 10", rest: "90 s", note: "Slightly lower box if knees are happy" },
      { ex: "db_floor_press", sets: "3 × 8 to 10", rest: "90 s", note: "" },
      { ex: "db_row", sets: "3 × 10 to 12 each side", rest: "60 s", note: "" },
      { ex: "dead_bug", sets: "3 × 8 each side", rest: "45 s", note: "" },
      { ex: "farmer", sets: "3 × 40 m", rest: "60 s", note: "" },
    ] },
    { name: "Day B (Wednesday)", items: [
      { ex: "kb_rdl", sets: "3 × 8 to 10", rest: "90 s", note: "To just below the knee" },
      { ex: "reverse_lunge", sets: "3 × 8 each side", rest: "60 to 90 s", note: "Back knee to the cushion, hold a chair" },
      { ex: "hk_press", sets: "3 × 8 each side", rest: "60 s", note: "" },
      { ex: "incline_pushup", sets: "3 × 8 to 12", rest: "60 s", note: "Lower the hands: sofa arm, then step" },
      { ex: "bird_dog", sets: "3 × 8 each side", rest: "45 s", note: "" },
      { ex: "side_plank", sets: "3 × 20 to 30 s each side", rest: "30 s", note: "" },
    ] },
    { name: "Day C (Friday)", items: [
      { ex: "bb_bridge", sets: "3 × 10", rest: "90 s", note: "Pad the bar with a towel" },
      { ex: "step_up", sets: "3 × 8 each side", rest: "60 s", note: "Hold dumbbells once easy" },
      { ex: "bb_floor_press", sets: "3 × 8", rest: "90 s", note: "Start with the empty bar" },
      { ex: "db_row", sets: "3 × 10 each side", rest: "60 s", note: "" },
      { ex: "curl_up", sets: "3 × 5 holds of 10 s", rest: "30 s", note: "" },
      { ex: "suitcase", sets: "3 × 30 m each side", rest: "60 s", note: "" },
    ] },
  ] },
  { key: "s", label: "Strength, weeks 9 to 12", weeks: "9-12", days: [
    { name: "Day A (Monday)", items: [
      { ex: "bb_floor_press", sets: "4 × 6 to 8", rest: "2 min", note: "Main lift of the day" },
      { ex: "kb_rdl", sets: "4 × 8", rest: "2 min", note: "Heaviest bell you can hinge with a flat back" },
      { ex: "goblet_squat", sets: "3 × 8", rest: "90 s", note: "Comfortable depth" },
      { ex: "db_row", sets: "4 × 8 to 10 each side", rest: "90 s", note: "" },
      { ex: "dead_bug", sets: "3 × 10 each side", rest: "45 s", note: "" },
      { ex: "farmer", sets: "4 × 40 m", rest: "90 s", note: "Heaviest you can carry tall" },
    ] },
    { name: "Day B (Wednesday)", items: [
      { ex: "hip_thrust", sets: "4 × 8", rest: "2 min", note: "Barbell with padding, or heaviest dumbbell" },
      { ex: "reverse_lunge", sets: "3 × 8 each side", rest: "90 s", note: "Dumbbells at sides, same limited depth" },
      { ex: "hk_press", sets: "3 × 6 to 8 each side", rest: "90 s", note: "" },
      { ex: "incline_pushup", sets: "3 × stop 2 reps short", rest: "60 s", note: "Floor push-ups if ready" },
      { ex: "side_plank", sets: "3 × 30 to 40 s each side", rest: "30 s", note: "Straight legs when easy" },
      { ex: "calf_raise", sets: "3 × 15", rest: "45 s", note: "Holding a dumbbell" },
    ] },
    { name: "Day C (Friday)", items: [
      { ex: "bb_rdl", sets: "3 × 6 to 8", rest: "2 min", note: "Light and smooth, or stay on the KB RDL" },
      { ex: "goblet_box", sets: "4 × 6 to 8", rest: "90 s", note: "Heaviest squat of the week" },
      { ex: "db_floor_press", sets: "3 × 10 to 12", rest: "60 s", note: "" },
      { ex: "db_row", sets: "3 × 12 each side", rest: "60 s", note: "" },
      { ex: "curl_up", sets: "3 × 5 holds of 10 s", rest: "30 s", note: "Then 1 round of bird dog and side plank" },
      { ex: "suitcase", sets: "3 × 40 m each side", rest: "60 s", note: "" },
    ] },
  ] },
];

const MOB = [
  { move: "Cat-cow", time: "1 min", aim: "Lower back", id: "1Y0YjXS9sKI", site: "Hinge Health" },
  { move: "Knee to chest, each side", time: "1 min", aim: "Lower back, glutes", id: "o8gAyDUh2bs", site: "Canadian Chiropractic Guideline Initiative" },
  { move: "Figure-4 stretch, each side", time: "1 min", aim: "Hips, glutes", id: "Xb5gHdYtHnk", site: "Canadian Chiropractic Guideline Initiative" },
  { move: "Hamstring stretch (towel round foot or standing)", time: "1 min", aim: "Hamstrings", id: "5f5aHVj-f9Q", site: "Hinge Health" },
  { move: "90/90 hip switches, slow", time: "1 min", aim: "Hip rotation", id: "t4Zz6-aG8Iw", site: "Jack Hanrahan Fitness" },
  { move: "Half-kneeling hip flexor stretch, each side", time: "1.5 min", aim: "Front of hips, lower back", id: "IBo1OB2CczQ", site: "Hinge Health" },
  { move: "Quad stretch (side-lying or standing), each side", time: "1 min", aim: "Knees, thighs", id: "wIlIjGBG46A", site: "Hinge Health" },
  { move: "Straight leg raise, 10 each side", time: "1 min", aim: "Knee strength", id: "hfR8wZzWWXw", site: "Hinge Health" },
  { move: "Calf and soleus stretch at a wall", time: "1 min", aim: "Calves, knees", id: "zV4TFmtSmkc", site: "Hinge Health" },
  { move: "Child's pose, slow breathing", time: "30 to 60 s", aim: "Lower back, relax", id: "LZgABs0IggM", site: "Hinge Health" },
];


const START = new Date(2026, 10, 9);
const DAY_PLAN = { 1: { type: "strength", day: 0 }, 2: { type: "walk", text: "30 to 40 min brisk walk" }, 3: { type: "strength", day: 1 }, 4: { type: "walk", text: "30 to 40 min brisk walk" }, 5: { type: "strength", day: 2 }, 6: { type: "walk", text: "45 to 60 min longer walk, hills welcome" }, 0: { type: "rest", text: "Rest day: easy stroll and your 10-minute stretch" } };
const STEPS_TARGET = [7000, 8000, 9000];
const WARMUP = [
  ["March on the spot", "1 minute, swing your arms"], ["Cat-cow", "8 slow reps"], ["Glute bridge", "10 reps, bodyweight"],
  ["Bird dog", "5 each side"], ["Hip hinge with a broom", "8 reps"], ["Sit-to-box", "8 reps, bodyweight"], ["Wall push-up", "10 reps"],
  ["Ramp-up sets", "Before the first big lift: one light set of 8, one medium set of 5"],
];
const COOLDOWN = [
  ["Knee to chest", "30 s each side"], ["Figure-4 stretch", "30 s each side"], ["Half-kneeling hip flexor stretch", "30 s each side, cushion under the knee"],
  ["Hamstring stretch with a towel", "30 s each side"], ["Quad stretch", "30 s each side"], ["Child's pose", "45 s of slow breathing"],
];
const MOB_SECS = [60, 60, 60, 60, 60, 90, 60, 60, 60, 45];
const MUSIC_YT = [
  { title: "1 Hour of Pop Workout Songs", by: "Epidemic Pop", id: "d8OL6m0ZblA" },
  { title: "70s and 80s Hits Remixed (102 to 140 BPM)", by: "Workout Music Source", id: "ZmPFDnsKg0Q" },
  { title: "Workout Music Mix, Best Gym Playlist", by: "Revive Music", id: "ld8nm6rcOm0" },
  { title: "Workout Drum and Bass Mix", by: "METHOD // Drum & Bass Mixes", id: "SYrjZ6voFCY" },
  { title: "Best Hard Rock Gym Workout Mix", by: "Lona Music Mix", id: "fAj1IyVs4sQ" },
];
const MUSIC_SP = [
  { title: "Beast Mode", id: "37i9dQZF1DX76Wlfdnj7AP" },
  { title: "Workout", id: "37i9dQZF1DX70RN3TfWWJh" },
  { title: "Power Workout", id: "37i9dQZF1DWUVpAXiEPK8P" },
  { title: "Gym Hits", id: "37i9dQZF1DXdxcBWuJkbcy" },
  { title: "Walk Like A Badass", id: "37i9dQZF1DX1tyCD9QhIWF" },
];
const SOURCES = [
  ["Vitamin D", "NHS", "https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/"],
  ["Back pain", "NHS", "https://www.nhs.uk/conditions/back-pain/"],
  ["Knee pain", "NHS", "https://www.nhs.uk/conditions/knee-pain/"],
  ["Strength exercises", "NHS", "https://www.nhs.uk/live-well/exercise/strength-exercises/"],
  ["Flexibility exercises", "NHS", "https://www.nhs.uk/live-well/exercise/flexibility-exercises/"],
  ["Physical activity guidelines for adults", "NHS", "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/"],
  ["Fish and shellfish", "NHS", "https://www.nhs.uk/live-well/eat-well/food-types/fish-and-shellfish-nutrition/"],
  ["Position stand: creatine supplementation (2017)", "JISSN", "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z"],
  ["Position stand: protein and exercise (2017)", "JISSN", "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8"],
];
const SAFETY = "Mild muscle effort is fine; sharp, catching or shooting pain, pins and needles, or pain that runs down a leg is not. Stop that exercise, use the easier option next time, and see your GP or a physiotherapist if it does not settle within a few days. Get urgent help (NHS 111, or 999 in an emergency) if back pain comes with numbness around your bottom or genitals or trouble controlling your bladder or bowels.";
const PAIN = [["0 to 3", "Green: normal effort or mild awareness", "Carry on; progress as planned"], ["4 to 5", "Amber: noticeable, should settle within 24 hours", "Keep the same weight or use the easier option"], ["6 to 10, or sharp", "Red: too much", "Stop that move today; if it lingers, see a GP or physio"]];
const SUBS = [["No bench", "Floor press replaces bench press; a sturdy chair seat supports rows."], ["No box", "A dining chair or sofa edge is the box for squats; stack a cushion to raise it."], ["No rack", "Roll the barbell over your legs for bridges and floor press; lift it from a step or blocks for RDLs."], ["Cold mornings", "When it is below 5 °C, do the warm-up indoors and walk in layers."]];
const PHASE_TABLE = [["Foundation", "1 to 4", "9 Nov to 6 Dec 2026", "Stop 3 to 4 reps short of failure", "Learn the hinge, squat and core patterns; build the habit. Week 4 lighter."], ["Build", "5 to 8", "7 Dec 2026 to 3 Jan 2027", "Stop 2 to 3 reps short", "Hip thrusts, kettlebell RDLs, lunges, barbell floor press. Christmas weeks flexible; week 8 lighter."], ["Strength", "9 to 12", "4 Jan to 31 Jan 2027", "Stop 1 to 2 reps short, never grind", "Heavier main lifts at 6 to 8 reps. Week 12: repeat week 9 weights and compare."]];
const PROGRESSION = [["Pick a starting weight", "One you could lift 3 or 4 more times with good form. Write it in the log."], ["Earn the next step", "When you hit the top of the rep range on every set and back and knees score 3 or less, add 1 to 2 kg for upper body or 2 to 4 kg for legs next time."], ["Hold or step back", "A 4 or 5 the next day means keep the weight; a 6 or more means use the easier option for a week."], ["Lighter weeks", "In weeks 4 and 8 drop one set from every exercise and keep the weights the same."]];
const WEEK_TABLE = [["Monday", "Strength Day A + warm-up and cool-down", "Daily steps target"], ["Tuesday", "10-minute mobility", "30 to 40 min brisk walk"], ["Wednesday", "Strength Day B + warm-up and cool-down", "Daily steps target"], ["Thursday", "10-minute mobility", "30 to 40 min brisk walk"], ["Friday", "Strength Day C + warm-up and cool-down", "Daily steps target"], ["Saturday", "10-minute mobility", "45 to 60 min longer walk, hills welcome"], ["Sunday", "Rest; 10-minute mobility", "Easy stroll"]];
const AVOID_OK = ["Glute bridges and hip thrusts", "Kettlebell deadlift from a block, then kettlebell RDL", "Goblet squats to a box or comfortable depth", "Reverse lunges and step-ups with limited depth", "Bird dogs, dead bugs, McGill curl-ups, side planks", "Carries, floor presses and supported rows"];
const AVOID_NO = ["Heavy conventional barbell deadlifts from the floor, especially in weeks 1 to 8", "Jumping, box jumps, burpees and running drills", "Deep, heavily loaded lunges or squats past comfortable depth", "Good mornings", "Sit-ups, crunches and Russian twists", "Kettlebell swings until the RDL is solid and pain-free; ask a coach first"];
const SUPPS = [["Creatine monohydrate", "3 to 5 g a day, any time, with water", "One of the best-studied supplements for strength and muscle with training", "Can raise creatinine on blood tests, so tell your GP; avoid with kidney problems unless your GP agrees"], ["Vitamin D", "10 micrograms (400 IU) a day, October to March", "NHS advice for UK adults in autumn and winter, for bones and muscles", "Do not exceed 100 micrograms (4,000 IU) a day unless prescribed"], ["Protein (food first)", "About 1.6 g per kg of body weight a day", "Supports muscle repair and growth when lifting", "A whey or soya shake is just convenient food; check with your GP if you have kidney disease"], ["Omega-3 (optional)", "Two portions of fish a week, one oily; or a fish or algae oil supplement", "Heart health; useful if you rarely eat oily fish", "Check with your GP if you take blood thinners"]];
