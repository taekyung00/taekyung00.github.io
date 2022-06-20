class Box
{
  constructor(x,y,z,w,i) //생성자
  {
    
    this.x=x;
    this.y=y;
    this.width=z;
    this.height=w;
    this.image=i
  }
  display()
  {
      push();
   imageMode(CENTER);
   noStroke();
   image(this.image,this.x, this.y, this.width, this.height);
   pop();
  }
}