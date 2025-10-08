// client/src/game/tugofwar/paragraphs.js
const tugOfWarParagraphs = [
    "The ancient library's vaulted ceilings cast long shadows over shelves of worn books. Dust drifted in beams of light, settling on yellowed pages marked by impatient fingers. A clock chimed faintly in the distance as the keeper traced a fragile spine. Curiosity overcame hesitation, and the cover lifted to reveal the first line, curled as if guarding its secret.",

    'At dawn on a windswept beach, waves lapped gently across shells and stones while gulls wheeled against the pale sky. The salty air carried the scent of seaweed and wood, clinging to her skin as she walked the shoreline. Sand glowed faintly pink under her feet, and the horizon seemed infinite, making her feel both small and boundless.',

    'The train rattled through the night, windows reflecting forests that flashed by unseen. Inside, soft lights revealed travelers half awake: one reading, another clutching a violin case, children staring at streaks of color outside. At each stop, doors hissed open, letting new echoes in before the journey pressed onward into the dark.',

    'High in the mountain pass, the wind bit cold and sharp, carrying wisps of fog across jagged cliffs. A hiker paused, listening to water rushing below and rocks shifting with hidden weight. The climb burned with every breath, yet the view of clouds glowing rose and gold filled her with clarity and life.',

    'The marketplace swelled with sound and color beneath the noon sun. Fabrics glimmered, spices burned with reds and yellows, and fruits glistened as if polished. Voices clashed with laughter, braying animals, and clattering feet. Scents of roasted meat and citrus filled the air, everything demanding notice at once.',

    'Rain fell softly against the window as city lights blurred into smears of color. Neon signs flickered, headlights shimmered across wet streets, and shadows bent in the alleys. Inside, a man hovered over his journal, pen still, while outside the city pulsed—relentless, chaotic, yet beautiful.',

    'At sunrise they planted a slender oak, branches trembling in the cool breeze. A droplet clung to a newborn leaf, glowing in the apricot sky as birds greeted the morning. They patted earth over the roots, whispering small words of care, and walked away believing beginnings matter.',

    'The old clock tower stood in silence, its hands frozen at a forgotten hour. Ivy wrapped its stone walls, roots pressing into mortar, pigeons nesting where bells once rang. Cobblestones below carried stories of footsteps long gone. Decay had replaced laughter, yet dignity remained in every crack.',

    'She opened the window at dusk, the air thick with jasmine, honeysuckle, and rain. Fireflies rose in slow arcs, petals closed, and insects sang into the night. A lantern glowed softly on the porch, its light marking the quiet shift from day to evening.',

    "The captain's cabin swayed with the sea, maps and journals scattered across the desk. Lantern light caught the brass of a compass while brine and tar hung in the air. Outside, moonlight shimmered on rolling swells. Bent over his charts, he traced lines toward a safe passage he could only imagine."
];



function getRandomParagraph() {
    return tugOfWarParagraphs[Math.floor(Math.random() * tugOfWarParagraphs.length)]
}

export { getRandomParagraph, tugOfWarParagraphs }