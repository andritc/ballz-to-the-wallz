var canvas = document.getElementById("can");
var context = canvas.getContext("2d");

let bodies = [];
let deltaTime = 0.01;
let timeScale = 0;
function start() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    setInterval(draw, deltaTime * 1000);
}

//The mass and velocity are assigned values, and the particle is redrawn every deltaTime, which as been assigned a value of 0.01
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "white";
    
    context.fillRect(0, 0, canvas.width,canvas.height);
    checkCollision();
    bodies.forEach((b) => {
        b.draw();
    });
}

function checkCollision() {
    for (let x = 0; x < bodies.length - 1; x++) {
        for (let y = x + 1; y < bodies.length; y++) {
            let v1 = bodies[x];
            let v2 = bodies[y];
            let distance = Vector2.Distance(v1.position, v2.position);
            if (v1.radius + v2.radius >= distance) {
                v1.velocity.x = -  v1.velocity.x
                v1.velocity.y = -  v1.velocity.y
                v2.velocity.x = - v2.velocity.x
                v2.velocity.y = - v2.velocity.y
            }
        }
    }
}

//The function draws the canvas which is what the particle is then drawn on.
class Body {
    constructor(mass, velocity, position, colour) {
        this.mass = mass
        this.colour = colour
        this.radius = Math.sqrt(mass);
        this.position = position;
        this.velocity = velocity;
    }
    // This class defines all the variables related to the particle
    draw() {
        this.position = Vector2.Add(this.position, Vector2.Multiply(this.velocity, deltaTime * timeScale));
        context.beginPath();
        context.arc(MetreToPixels(this.position.x), MetreToPixels(this.position.y), MetreToPixels(this.radius), 0, 2 * Math.PI);
        context.fillStyle = this.colour;
        context.fill();
        this.checkWalls();
    }


    checkWalls() {
        if (this.position.x <= this.radius) {
            this.velocity.x = - this.velocity.x
        } else if (this.position.x >= PixelToMetres(canvas.width) - this.radius) {
            this.velocity.x = - this.velocity.x
        }
        if (this.position.y <= this.radius) {
            this.velocity.y = - this.velocity.y
        } else if (this.position.y >= PixelToMetres(canvas.height) - this.radius) {
            this.velocity.y = - this.velocity.y
        }
    }
}
// The particle is drawn according to the variables entered earlier. The function MetreToPixel is converting the pixels into metres to make calculations simpler 
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // vectors are split into x and y components which means a magnitude and direction can be assigned
    static Add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static Multiply(v1, s) {
        return new Vector2(v1.x * s, v1.y * s);
    }

    static Minus(v1, v2) {
        return Vector2.Add(v1, Vector2.Multiply(v2, -1));
    }

    static Distance(v1, v2) {
        let v = Vector2.Minus(v1, v2);
        return Math.sqrt(v.x ** 2 + v.y ** 2)
    }
}
// These functions are later used for the vector calculations 
const METER = 20;

function PixelToMetres(pix) {
    return pix / METER;
}

function MetreToPixels(metre) {
    return metre * METER;
}
