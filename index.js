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
    document.getElementById("kineticEnergy").innerText = 0.5 * bodies[0].mass * bodies[1].velocity.modulus() ** 2 + 0.5 * bodies[1].mass * bodies[1].velocity.modulus() ** 2
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "white";
    
    context.fillRect(0, 0, canvas.width,canvas.height);
    checkCollision();
    bodies.forEach((b) => {
        b.draw();
    });
}
let doNotCrash = 0;
function checkCollision() {
    doNotCrash -= 1
    if(timeScale == 0 || doNotCrash > 0){
        return;
    }
    for (let x = 0; x < bodies.length - 1; x++) {
        for (let y = x + 1; y < bodies.length; y++) {
            let ball1 = bodies[x];
            let ball2 = bodies[y];
            let distance = Vector2.Distance(ball1.position, ball2.position);
            if (ball1.radius + ball2.radius >= distance) {
                if (ball1.radius + ball2.radius > distance){
                    let distanceToGoBack = ball1.radius + ball2.radius - distance;
                    // Each one has to go back by the distanceToGoBack / 2 proportional to it's velocity
                    let velocityRatio = ball1.velocity.modulus() / (ball2.velocity.modulus() + ball1.velocity.modulus())
                    let actualDistanceToGoBackBall1 = distanceToGoBack * velocityRatio;
                    let actualDistanceToGoBackBall2 = distanceToGoBack * (1 - velocityRatio);
                    ball1.position = Vector2.Minus(ball1.position, Vector2.Multiply(Vector2.Unit(ball1.velocity), actualDistanceToGoBackBall1))
                    ball2.position = Vector2.Minus(ball2.position, Vector2.Multiply(Vector2.Unit(ball2.velocity), actualDistanceToGoBackBall2))
                }
                // ball1.velocity.x = - ball1.velocity.x;
                // ball1.velocity.y = - ball1.velocity.y;
                // ball2.velocity.x = - ball2.velocity.x;
                // ball2.velocity.y = - ball2.velocity.y;
                bounceBalls(ball1, ball2)
                doNotCrash = 20;
                return
            }
        }
    }
}

/**
 * 
 * @param {Body} ball1 
 * @param {Body} ball2 
 */
function bounceBalls(ball1, ball2){
    const e = 1;
    let centres = Vector2.Unit(Vector2.Minus(ball1.position, ball2.position));
    let angle = Math.atan2(centres.y, centres.x);
    let parallelVelocityBall1 = ball1.velocity.x * Math.sin(angle) + ball1.velocity.y * Math.sin(angle);
    let parallelVelocityBall2 = ball2.velocity.x * Math.sin(angle) + ball2.velocity.y * Math.sin(angle);
    parallelVelocityBall2 *= -1;
    // Initial momentum of a parallel - initial momentum of B parallel = mass1 * newv1 + mass2 * newv2
    let matrix = math.matrix([
        [ball1.mass, ball2.mass],
        [-1         , 1         ]])
    let equals = math.matrix([
        [ball1.mass * parallelVelocityBall1 + ball2.mass * parallelVelocityBall2],
        [-e * parallelVelocityBall1 + e * parallelVelocityBall2]])
    let result = math.multiply(math.inv(matrix), equals)
    console.log(result._data)
    let newv1 = result._data[0][0];
    let newv2 = result._data[1][0];
    console.log(newv1)
    let perpendicularVelocity1 = new Vector2(ball1.velocity.x * Math.cos(angle), ball1.velocity.y * Math.cos(angle));
    let perpendicularVelocity2 = new Vector2(ball2.velocity.x * Math.cos(angle), ball2.velocity.y * Math.cos(angle));
    ball1.velocity = Vector2.Add(Vector2.Multiply(centres, newv1), perpendicularVelocity1)
    ball2.velocity = Vector2.Add(Vector2.Multiply(centres, newv2), perpendicularVelocity2)
}

//The function draws the canvas which is what the particle is then drawn on.
class Body {
    constructor(mass, velocity, position, colour) {
        this.mass = mass;
        this.colour = colour;
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

    // Checks whether the ball has crashed into a wall
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

    static Unit(v1){
        let modulus = Math.sqrt(v1.x ** 2 + v1.y ** 2)
        return new Vector2(v1.x / modulus, v1.y / modulus)
    }

    modulus(){
        return Math.sqrt(this.x ** 2 + this.y ** 2)
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
