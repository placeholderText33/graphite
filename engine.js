const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

canvas.width = window.innerWidth - 564;
// again, sorry for the magic number above but I was playing around with the size of the context and decided that this looks nice
canvas.height = window.innerHeight;

const maxSize = 5;
let pointer = -1
let startX;
let startY;
let currentShape;
let contextShape;
let isDragging = false;
const shapes = [];
const obstacles = [];
let elasticity = 0.6;
let mu = 0.3;

canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    displayObjectMenu(event.clientX, event.clientY)
})


canvas.addEventListener("mousedown", (event) => {
    if (event.buttons == 1) {
        mouseDown(event)
        if (currentShape != contextShape) {
            clearObjectMenu(); 
            contextShape = null;
        }
    }
})

function gravityDisplay() {
    if (document.getElementById("gravity_dropdown").style.display == "none") {
        document.getElementById("gravity_dropdown").style.display = "block";
    } else {
        document.getElementById("gravity_dropdown").style.display = "none"
    }

}

function circleCreate() {
    //sorry for all of the magic numbers below, they all describe the ranges of the numbers generated
    let randomX = Math.random() * canvas.width;
    let randomY = Math.random() * 800;
    let randomRad = Math.random() * 25 + 15;
    let randomMass = Math.random() * 50;
    let red = Math.random() * 256;
    let blue = Math.random() * 256;
    let green = Math.random() * 256;
    if (shapes.length > 1) {
        shapes.forEach(shape => {
            if (Math.abs(shape.pos.x - randomX) <= shape.radius && Math.abs(shape.pos.y - randomY) <= shape.radius) {
                randomX = Math.random() * canvas.width;
                randomY = Math.random() * 800;
            }
        })
    }
    // "8" is just an arbitrary array size limit i have set for performance
    if (shapes.length < 8) {
        shapes.push(new Circle(randomX, randomY, randomRad, randomMass, "rgb(" + red + ", "+ green +", "+ blue +")"))
    }
};


function deleteObject() {
    contextIndex = shapes.indexOf(contextShape);
    shapes.splice(contextIndex, 1)
    contextShape = null;
    currentShape = null;
    document.getElementById("property_menu").style.display = "none";
    document.getElementById("main_menu").style.display = "block"
}


 
let gravSlider = document.getElementById("grav_slider");
let gravOutput = document.getElementById("grav_output");
let radSlider = document.getElementById("radius_slider");
let radOutput = document.getElementById("radius_val");
let mass_slider = document.getElementById("mass_slider");
let massOutput = document.getElementById("mass_val");

function gravitySlider() {
    gravOutput.innerHTML = gravSlider.value;
    gravity.y = Number(gravSlider.value); 
}

function radiusSlider() {
    radOutput.innerHTML = contextShape.radius
    radOutput.innerHTML = radSlider.value;
    contextShape.radius = Number(radSlider.value);
}

function massSlider() {
    massOutput.innerHTML = contextShape.mass;
    massOutput.innerHTML = mass_slider.value;
    contextShape.mass = Number(mass_slider.value);
}

function lineCreate() {
    if (obstacles.length < 6) {
        obstacles.push(new Line(Math.random() * canvas.width, Math.random()* 800, Math.random() * canvas.width, Math.random() * 800));
        document.getElementById("line_delete").style.display = "block";
    }
}

function lineDelete() {
    obstacles.pop(obstacles[obstacles.length - 1]);
    if (obstacles.length == 1) {
        document.getElementById("line_delete").style.display = "none";
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };

    sub(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    };

    mag() {
        return Math.sqrt(((this.x) ** 2) + ((this.y) ** 2));
    };

    scale(number) {
        return new Vector(this.x * number, this.y * number);
    };

    unit() {
        if (this.mag() == 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(this.x / this.mag(), this.y / this.mag());
        }
    };

    tangent() {
        return new Vector(-this.y, this.x);
    }

    scalarProd(vector) {
        return (this.x * vector.x) + (this.y * vector.y);
    };

    display(startX, startY) {
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(startX + (this.x * 3), startY + (this.y * 3));
        context.stroke();
    }

};

class Circle {
    constructor(x, y, radius, mass, colour) {
        this.pos = new Vector(x,y);
        this.radius = radius;
        this.mass = mass;
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.colour = colour;
        this.elasticity = 0;
    }

    draw() {
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        context.fillStyle = this.colour;
        context.fill();
        context.stroke(); 
    }

    displayVel() {
        this.vel.display(this.pos.x, this.pos.y);
    }

    displayGrav() {
        gravity.display(this.pos.x, this.pos.y);
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.mu = Math.random() * 1
    }
    draw() {
        context.beginPath();
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.end.x, this.end.y);
        context.stroke();
    };

};

let gravity = new Vector(0, 0.2);
let line1 = new Line(0, 800, canvas.width, 800);
obstacles.push(line1);

function display() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        shape.draw();
        if (shape != currentShape) {
            shape.vel = shape.vel.add(shape.acc);
            shape.pos = shape.pos.add(shape.vel);
        };
    });
    obstacles.forEach(obstacle => {
        obstacle.draw();
    });

    window.requestAnimationFrame(display);
}
display();

// checks if the mouse is within the shape in the canvas
function mousePosCheck(x, y, shape) {
    if (Math.abs(shape.pos.x - x) <= shape.radius && Math.abs(shape.pos.y - y) <= shape.radius) {
        return true;
    };
    return false;

};

// checks if the mouse has been pressed
function mouseDown(event) {
    startX = event.clientX
    startY = event.clientY
    for(let i = 0; i < shapes.length; i++) {
        if(mousePosCheck(startX, startY, shapes[i]) == true) {
            currentShape = shapes[i];
            currentShape.vel.x = 0;
            currentShape.vel.y = 0;
            isDragging = true;
            return;
        }
    } 
}

function gravVecDisplay() {
    shapes.forEach(shape => {
        shape.displayGrav();
    })
    window.requestAnimationFrame(gravVecDisplay);
}

function velVecDisplay() {
    shapes.forEach(shape => {
        shape.displayVel();
    })
    window.requestAnimationFrame(velVecDisplay);
}


// checks if the mouse button has been released 
function mouseRelease() {
    if (isDragging == false) {
        return;
    }
    isDragging = false;
    currentShape.vel.x = 0;
    currentShape.vel.y = 0;
    currentShape = null;
    return;
}

// checks if the mouse is inside the canvas
function mouseOut() {
    if (isDragging == false) {
        return;
    }
    isDragging = false;
    currentShape = null;
    return;
}

// handles the actual shape dragging
function mouseMove(event) {
    if (isDragging == false) {
        return;
    }
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    currentShape.vel.x = mouseX - startX;
    currentShape.vel.y = mouseY - startY;
    startX = mouseX;
    startY = mouseY;
    currentShape.pos = currentShape.pos.add(currentShape.vel)
}

canvas.onmouseup = mouseRelease;
canvas.onmouseout = mouseOut;
canvas.onmousemove = mouseMove;

function radiusDropdown() {
    if (document.getElementById("radius_dropdown").style.display == "none") {
        document.getElementById("radius_dropdown").style.display = "block"
    } else {
        document.getElementById("radius_dropdown").style.display = "none" 
    }
}

function massDropdown() {
    if (document.getElementById("mass_dropdown").style.display == "none") {
        document.getElementById("mass_dropdown").style.display = "block"
    } else {
        document.getElementById("mass_dropdown").style.display = "none"
    }
}


function displayObjectMenu(mouseX, mouseY) {
    shapes.forEach(shape => {
        if (mousePosCheck(mouseX, mouseY, shape) == true) {
            contextShape = shape;
            document.getElementById("main_menu").style.display = "none";
            document.getElementById("property_menu").style.display = "block";
            gravOutput.innerHTML = gravSlider.value;
            radOutput.innerHTML = radSlider.value
            massOutput.innerHTML = mass_slider.value;
        }
    })
}

function clearObjectMenu() {
    if (document.getElementById("property_menu").style.display == "block") {
        document.getElementById("property_menu").style.display = "none";
        document.getElementById("main_menu").style.display = "block";
    }
}

const borderCollisionLoop = setInterval(borderCollision);

function borderCollision() {
    shapes.forEach(shape => {
        if (shape.pos.x - shape.radius < 0) {
            shape.pos.x = 0 + shape.radius;
            shape.vel.x *= -1 * elasticity;
        }
        else if (shape.pos.x + shape.radius > canvas.width) {
            shape.pos.x = canvas.width - shape.radius;
            shape.vel.x *= -1 * elasticity;
        }
        else if (shape.pos.y - shape.radius < 0) {
            shape.pos.y = 0 + shape.radius;
            shape.vel.y *= -1 * elasticity;
        }
    })  
}

function circleIntersect(circle1, circle2) {
    let distance = (circle2.pos.sub(circle1.pos)).mag();
    if (distance <=  (circle1.radius + circle2.radius)) {
        return true;
    }
    return false;
}

function lineCollisionDet(circle, line) {
    let minDist = lineNearest(circle, line).sub(circle.pos);
    if (minDist.mag() <= circle.radius) {
        return true;
    }
    return false;
}

function lineNearest(circle, line) {
    //projects the distance between the circle and the line onto the line
    const endDistanceVector = line.end.sub(circle.pos);
    const startDistanceVector = line.start.sub(circle.pos);
    const lineUnit = line.end.sub(line.start).unit();
    const startProjectionMag = startDistanceVector.scalarProd(lineUnit);
    const endProjectionMag = endDistanceVector.scalarProd(lineUnit);
    
    //finds the vector perpendicular to the line, and adds it to the circle's position to find the nearest point
    const projectionVector = lineUnit.scale(endProjectionMag);
    const perpendicularVector = endDistanceVector.sub(projectionVector);
    const nearestPoint = circle.pos.add(perpendicularVector);
    
    //if the projection magnitude is negative, it means that the end of the line is closest to the circle
    if (endProjectionMag < 0) {
        return line.end;

    //a positive magnitude (relative to the start of the line) means that the start of the line is closest
    } else if (startProjectionMag > 0) {
        return line.start;
    //if neither of the above conditions are met, the end points are not the closest points
    } else {
        return nearestPoint;
    }

}

function lineAngle(line) {
    // calculates the angle of the line, relative to that of a horizontal one
    const lineVector = line.end.sub(line.start);
    const relativeLine = new Line(line.end.x, line.end.y, line.end.x - 50, line.end.y)
    const newLineVector = relativeLine.start.sub(relativeLine.end);
    const angle = Math.acos(lineVector.scalarProd(newLineVector) / (lineVector.mag() * newLineVector.mag()));
    if (angle > Math.PI / 2) {
        return Math.PI - angle
    }
    return angle
}

function lineCollisionRes(circle, line) {
    // repositions the circle based off of its intersection with the line
    const nearestPoint = lineNearest(circle, line);
    const distanceVector = nearestPoint.sub(circle.pos);
    const distUnit = distanceVector.unit();
    const intersectionMag  = circle.radius - distanceVector.mag();
    const interectionVector = distUnit.scale(intersectionMag);
    circle.pos = circle.pos.sub(interectionVector);

    // calculates the reaction force and friction magnitude based off of the angle of that line
    let reaction;
    if (lineAngle(line) == 0) {
        reaction = gravity.y * circle.mass
    } else {
        reaction = gravity.y * circle.mass * Math.sin(lineAngle(line));
    }
    const frictionMag = mu * reaction; 

    // projects velocities along the normal and tangent of the collision
    const tangentUnit = distUnit.tangent();
    const normalProjection = circle.vel.scalarProd(distUnit);
    const tangentProjection = circle.vel.scalarProd(tangentUnit);

    // scales the normal velocity by its unit vector
    // calulates the friction and momentum vectors for the tan velocity
    let normalVel = distUnit.scale(-normalProjection * elasticity);
    let tangentVel = tangentUnit.scale(tangentProjection);
    let tanMomentum = tangentVel.scale(circle.mass)
    const frictionVec = tangentVel.unit().scale(-frictionMag);
        
    // calculates the tan velocity based off of its momentum
    // calculates final velocity
    tanMomentum = tanMomentum.add(frictionVec);
    let finalTangentVel = tanMomentum.scale(1 / circle.mass)

    circle.vel = normalVel.add(finalTangentVel);
}


function circleCollisionRes(circle1, circle2) {
    // repositions circles based off of their intersection with one another
    const distanceVector = circle1.pos.sub(circle2.pos);
    const distUnit = distanceVector.unit();
    const intersectionDepth = distanceVector.mag() - (circle1.radius + circle2.radius);
    const interectionVector = distUnit.scale(intersectionDepth);
    circle1.pos = circle1.pos.sub(interectionVector);
    circle2.pos = circle2.pos.add(interectionVector);

    // projects the two objects' velocities along the normal and the tangent of the collision
    const tangentUnit = distUnit.tangent();
    const c1NormalProjection = circle1.vel.scalarProd(distUnit);
    const c1VelTangentProjection = circle1.vel.scalarProd(tangentUnit);
    const c2TangentProjection = circle2.vel.scalarProd(distUnit);
    const c2NormalProjection= circle2.vel.scalarProd(tangentUnit);

    // scales the projection magnitudes by their respective unit vectors (either the normal or tangent)
    const c1NormalVel = distUnit.scale(((c1NormalProjection * (circle1.mass - circle2.mass)) + (c2NormalProjection  * 2 * circle2.mass)) / (circle1.mass + circle2.mass));
    const c2NormalVel = distUnit.scale(((c2TangentProjection * (circle2.mass - circle1.mass)) + (c1NormalProjection * 2 * circle1.mass)) / (circle1.mass + circle2.mass));
    const c1TangentVel = tangentUnit.scale(c1VelTangentProjection * elasticity);
    const c2TangentVel = tangentUnit.scale(c2NormalProjection * elasticity);

    // calculates the final velocity
    circle1.vel = c1NormalVel.add(c1TangentVel);
    circle2.vel = c2NormalVel.add(c2TangentVel); 
};


const collisionLoop = setInterval(collision);

function collision() {
    shapes.forEach(shape => {
        obstacles.forEach(obstacle => {
            if (lineCollisionDet(shape, obstacle)) {
                lineCollisionRes(shape, obstacle);
            }
        })
    });
    for (let i = 0; i < shapes.length; i++) {
        let obj1 = shapes[i];
        for (let j = i + 1; j < shapes.length; j++) {
            let obj2 = shapes[j];
            if (circleIntersect(obj1, obj2) == true) {
                circleCollisionRes(obj1, obj2);
            }
        }
    }
}

const gravityLoop = setInterval(gravityFunc)

function gravityFunc() {
    shapes.forEach(shape => {
        shape.vel = shape.vel.add(gravity);
    })
    if (currentShape) {
        currentShape.vel.y = 0;
    };
};

