class Item
{
  constructor(x,y,z,w,i) //생성자
  {
    this.x=x;
    this.y=y;
    this.width=z;
    this.height=w;
    this.item=i;
  }
  display()
  {
      push();
   imageMode(CENTER);
noStroke();
   image(this.item,this.x, this.y, this.width, this.height);
   pop();
  }
}