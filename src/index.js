let prompt = "write a text-based horror adventure prompt, with 2-3 choices numbered";
let test = `write a text-based horror adventure prompt, with 2-3 choices numbered

You wake up in a strange room with no windows and one door. 

	1	Examine the room for clues
2. Try the door
3. Scream for help

Try the door
You cautiously approach the door and reach for the handle. The door is locked. 

	1	Look for a key
2. Try to break down the door
3. Scream for help

Scream for help
You call out for help, but the only response is a deep, menacing laugh from somewhere in the room. 

	1	Hide
2. Search the room for the source of the laugh
3. Try to break down the door

Search the room for the source of the laugh
You slowly move around the room, searching for the source of the laugh. You finally find it: a tall figure in a dark cloak standing in the corner of the room. 

	1	Run for the door
2. Talk to the figure
3. Attack the figure

Scream for help
You call out for help, but the only response is a deep, menacing laugh from somewhere in the room. 

	1	Hide
2. Search the room for the source of the laugh
3. Try to break down the door

Search the room for the source of the laugh
You slowly move around the room, searching for the source of the laugh. You finally find it: a tall figure in a dark cloak standing in the corner of the room. 
`;
let choices = {
    1: "",
    2: "",
    3: "",
};
let incoming;
let storyText;
let chindex = 1;
let frindex = 30;
let padding;
let isLoading = true;
let isKeyPressed = false;
let isTesting = false;
let isGlitching = 7;

function preload() {
    getAICompletion();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    if (!storyText || isLoading) {
        push();
            fill('#FFC107');
            textSize(16);
            textAlign(CENTER);
            translate((width/2), height - 50);
            text("Loading...", 0, 0);
        pop();
        return;
    }
    if (random() > 0.75) {
        background(255, 255, 255, 0.3);
    } else {
        clear();
    }
    fill('green');
    let padding = width / 5;
    let pWidth = width - padding;
    let pHeight = height - padding;
    let story = storyText.replace(prompt, "Type 1, 2, or 3 on the keyboard to continue the story.");
    textWrap(WORD);
    textFont("Times New Roman");
    textSize(20);
    textAlign(LEFT, BOTTOM);
    text(story.substring(0, chindex), 60, 0, width > 600 ? pWidth : width - 60, pHeight);
    if (chindex < story.length) {
        chindex++;
        drawGlitch();
        frameRate(random(20, frindex += 0.2));
        if (choices.length < 0) {
            push();
                fill('#FFC107');
                textSize(16);
                textAlign(CENTER);
                translate((width/2), height - 50);
                text("\nThere are no choices.", 0, 0);
            pop();
        }
    }
    // frameRate(100);
}

function getAICompletion() {
    isLoading = true;
    if (isTesting) {
        incoming = test;
        getChoices(storyText ? incoming.substring(storyText.length) : incoming); // get choices from most recent text
        storyText = incoming;
        setTimeout(() => {
            isLoading = false;
            clearTimeout();
        }, 500);
        return;
    }
    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization:
                "Bearer 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",
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: (storyText ? storyText : prompt),
            max_tokens: 256,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            best_of: 1,
            echo: true,
            logprobs: 0
        }),
    })
        .then((r) => r.json())
        .then((d) => {
            let _text = d.choices[0].text;
            incoming = storyText ? _text.substring(storyText.length) : _text;
            getChoices(incoming); // get choices from most recent text
            storyText = _text;
            isLoading = false;
            isKeyPressed = false;
            // print({ storyText });
        });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    let newPrompt;
    if (isKeyPressed) return;
    isKeyPressed = true;
    switch (keyCode) {
        case 49:
            if (choices[1]) newPrompt = choices[1];
            break;
        case 50:
            if (choices[2]) newPrompt = choices[2];
            break;
        case 51:
            if (choices[3]) newPrompt = choices[3];
            else alert("please choose a valid choice");
            break;
        default:
            break;
    }
    // print(prompt);
    if (newPrompt) {
        storyText += "\n\n" + newPrompt + "\n";
        redraw();
        getAICompletion();
    }
}

function getChoices(inText) {
    if (!inText) return;
    let spl = inText.split(/\n[1-3][.]*/g);
    for (let i = 1; i < 4; i++) {
        if (spl[i]) choices[i] = spl[i];
    }
    // print({ choices });
}

function drawGlitch() {
    if (random() > 0.998 || isGlitching < 7) {
        isGlitching = isGlitching === 0 ? 7 : isGlitching - 1;
        for (let i = 0; i < 75; i++) {
            let sq = random(5, 11);
            push();
            stroke('rgba(163,255,197,0.56)');
            fill('rgba(158,158,158,0.64)');
            if (random() > 0.99) fill('rgba(75,75,75,0.55)');
            rect(random(0, width), random(0, height), sq, sq);
            pop();
        }
    }
}
