const Canvas = document.getElementById("canvas1")
const context = Canvas.getContext("2d")
Canvas.width = window.innerWidth
Canvas.height = window.innerHeight

//   the frame issue staff
let toNextRaven = 0
let intervalForNext = 400
let lastTime = 0
 
 
 let raven = []
//  then we do the class forthe Revan
class Raven{

    constructor(){
        this.spriteWidth = 271
        this.spriteheight = 195
     
        this.SizeModification  = Math.random()*0.6 + 0.4;
        this.width = this.spriteWidth * this.SizeModification;
        this.height = this.spriteheight * this.SizeModification;
        this.x = Canvas.width;
        this.y = Math.random()*(Canvas.height - this.height)
        this.Xdirection = Math.random()*5 + 3
        this.Ydirection = Math.random()*5 - 2.5
        this.spriteImage = new Image()
        this.spriteImage.src = "/Sprite/raven.png"
        this.frame = 0;
        this.maxframe = 4;
        this.timeSinceFlap  = 0;
        this.FlapInterval = Math.random()*50+50;
  


        //   to truck if a raven has move from the screen
        this.markedForDeleting = false
    }
    update(delta_time){ 
     this.x-=this.Xdirection
      if(this.x< 0 - this.width)this.markedForDeleting = true
       this.timeSinceFlap+=delta_time
      if (this.timeSinceFlap > this.FlapInterval){
        if(this.frame >this.maxframe)this.frame=0
        else this.frame++;
        this.timeSinceFlap = 0
  
      }
     
    }
    //  the drawing of the raven
    drawRaven(){
        //  context.fillRect(this.x,this.y,this.width,this.height)
         context.drawImage(this.spriteImage,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteheight,this.x,this.y,this.width,this.height)
    }
}

//  creating just one instance of the raven

let Oneinstance =  new Raven()
 
// the animation function
function animate(timestamp){
     context.clearRect(0,0,Canvas.width,Canvas.height)
    //  testing it
    let delta_time = timestamp - lastTime
    lastTime = timestamp
    toNextRaven+=delta_time

    if(toNextRaven > intervalForNext){
         raven.push(new Raven())
         toNextRaven = 0

    }
// console.log(delta_time);
    [...raven].forEach(obj => obj.update(delta_time));
    [...raven].forEach(obj => obj.drawRaven());

    raven = raven.filter(obj => !obj.markedForDeleting)
    console.log(raven)
    requestAnimationFrame(animate)
}

animate(0)