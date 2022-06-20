let button1,button2,button3,buttontostage1again,buttontostage2,buttontostage2again,buttontostage1;

let startbackgroundmusic,playbackgroundmusic,movepage,threeleft;
let movepagecheck1=0,movepagecheck2=0,movepagecheck3=0,movepagecheck4=0,movepagecheck5=0,startbackgroundmusiccheck=0,threeleftcheck=0,playbackgroundmusiccheck=0;

let stage=0;

let Heightoftopbottom1=60;

let clP=0,clV=0;

let p1X;
let p1Y;
let p1Width=30;
let p1Height=60;

let p2;
let v2;

let box=[],boximage1,boximage2;

let thorn=[],thorn_left,thorn_right,thorn_bottom,thorn_top;

let v1;

let nowstatementP1 ="nothing",nowstatementV1="nothing";
let nowstatementP2 ="nothing",nowstatementV2="nothing";

let game1Item=[],game2Item=[];

let pastpX=[];
let pastpY=[];

let i=0;

let pastvX=[];
let pastvY=[];

let redcount=0,blackcount=0, purplecount=0, greencount=0;

let readytoU=false,readytoREADY=false;

let previous_time1=0,current_time1=0,interval_time1=0,t,millischeck=0,trashtime;

let player1,villain1,item,player2,villain2;

function preload()
{
  startbackgroundmusic=loadSound('media/start_background_music.mp3');
  playbackgroundmusic=loadSound('media/playbackgroundmusic.m4a');
  movepage=loadSound('media/movepage.m4a');
  threeleft=loadSound('media/threeleft.m4a');
  player1=loadImage('media/player1.jpg');
  villain1=loadImage('media/villain1.jpg');
  player2=loadImage('media/player2.jpg');
  villain2=loadImage('media/villain2.jpg');
  item=loadImage('media/item.jpg');
  boximage1=loadImage('media/box1.jpg');
  boximage2=loadImage('media/box2.jpg');
  thorn_left=loadImage('media/thorn_left.png');
  thorn_right=loadImage('media/thorn_right.png');
  thorn_top=loadImage('media/thorn_top.png');
  thorn_bottom=loadImage('media/thorn_bottom.png');

}
function setup() 
{
createCanvas(windowWidth,windowHeight);
rectMode(CENTER);
textAlign(CENTER);

button1=createButton('A');
button2=createButton('U');
button3=createButton('READY?!?!?');
buttontostage1again=createButton('AGAIN?');
buttontostage2=createButton('MAP2');
buttontostage2again=createButton('AGAIN?');
buttontostage1=createButton('MAP1');

button1.position(-400,-400);
button2.position(-400,-400);
button3.position(-400,-400);
buttontostage1again.position(-400,-400);
buttontostage2.position(-400,-400);
buttontostage2again.position(-400,-400);
buttontostage1.position(-400,-400);

p1X=int(width*(4/5));
p1Y=height-(Heightoftopbottom1+p1Height/2);

v1=createVector(int(width*(1/5)),height-(Heightoftopbottom1+p1Height/2));

p2=createVector(width/2+height*(1/8)+p1Width/2,height/2+height*(1/8)+p1Height/2);
v2=createVector(width/2-height*(1/8)-p1Width/2,height/2-height*(1/8)-p1Height/2);

for (let x=0; x<=100;x++)
{
  box[x]=[];
  for(let y=0; y<=100; y++)
  {
    box[x][y]=1;
  }
}
for(let x=0;x<=10;x++)
{
  pastpX[x]=[];
  pastpY[x]=[];
  pastvX[x]=[];
  pastvY[x]=[];

}
for (let x=0; x<=2;x++)
{
  thorn[x]=[];
}
}
function draw() {
  frameRate(100);
 gamechange(t); 
 musicismylife();
 if (stage==0)//first page
 {
 intro1();
 }
 else if (stage==0.5)//second page
 {
  if(movepagecheck1==0)
  {
  movepage.play();
  movepagecheck1++
  }
  intro2();
 }
 else if (stage==0.7)//third page
 {
  if(movepagecheck2==0)
  {
  movepage.play();
  movepagecheck2++
  }
  intro3();
 }
else if(stage==0.9)//ready to go
{
  if(movepagecheck3==0)
  {
  movepage.play();
  movepagecheck3++
  }
 startgame();
}
 else if (stage==1)
 {
  if(movepagecheck4==0)
  {
  movepage.play();
  movepagecheck4++
  }
  current_time1=millis();
  if(millischeck==0)
  {
    trashtime=millis()
  interval_time1=current_time1-previous_time1-trashtime;
  }
  else
  {
    interval_time1=current_time1-previous_time1-trashtime;
  }
  millischeck++
  t=int(15.2-interval_time1/1000);

   game1();
 }
 else if(stage==1.5)//stage1 end
 {
  if(movepagecheck5==0)
  {
  movepage.play();
  movepagecheck5++
  }
  if((blackcount>redcount)||(blackcount<redcount))
  {
  game1_end();
  }
  else
  {
  game1_again();
  }
 }
 else if(stage==-1.1)//collide 
 {
  game1_again();
 }
 else if(stage==2)
 {
  if(movepagecheck4==0)
  {
  movepage.play();
  movepagecheck4++
  }
  current_time1=millis();
  if(millischeck==0)
  {
    trashtime=millis()
  interval_time1=current_time1-previous_time1-trashtime;
  }
  else
  {
    interval_time1=current_time1-previous_time1-trashtime;
  }
  millischeck++
  t=int(20.2-interval_time1/1000);
  game2();
 }
 else if(stage==2.5)//stage 2 end
 {
  if(movepagecheck5==0)
  {
  movepage.play();
  movepagecheck5++
  }
  if((purplecount>greencount)||(purplecount<greencount))
  {
  game2_end();
  }
  else
  {
  game2_again();
  }
 }
 else if(stage==-1.2)//collide 
 {
  game2_again();
 }
 else if(stage==-1.3)//collidewiththron
 {
  game2_again();
 }
}
function musicismylife()
{
if((stage<0)||((stage>=0 )&& (stage<1))||((stage>1)&&(stage<2))||stage>2)
{
  playbackgroundmusiccheck=0;
  playbackgroundmusic.pause();
  threeleftcheck=0;
  threeleft.pause();
  if(startbackgroundmusiccheck==0)
  {
  startbackgroundmusic.play();
  startbackgroundmusiccheck++
  }
}
else if(stage==1||stage==2)
{ 
  startbackgroundmusiccheck=0;
  startbackgroundmusic.pause();
  if(playbackgroundmusiccheck==0)
  {
    playbackgroundmusic.play();
    playbackgroundmusiccheck++
    
    
  }
  if(threeleftcheck==0&&t<=3)
  {
    threeleft.play()
    threeleftcheck++
    print('threeleft');
  }
}
}
function game1()
{
  print(stage);
  movepagecheck5=0;
  background (255);

box[1][0]=new Box(width/2,height-Heightoftopbottom1/2, width, Heightoftopbottom1,boximage1)//bottom
box[1][1]=new Box(width/2, Heightoftopbottom1/2, width, Heightoftopbottom1,boximage1)//top
box[1][2]=new Box(width/2,height-140,30,160,boximage1)
box[1][3]=new Box(2.5,height/2,5,height)//left
box[1][4]=new Box(width-3,height/2,6,height)//right
//boxcount=5
box[1][0].display();
box[1][1].display();
box[1][2].display();
// box[3].display();
// box[4].display();




 game1Item[1]= new Item(width*(7/8),height-80,40,40,item)//updown
game1Item[2]=new Item(width*(1/8),height-80,40,40,item)//updown

redcount=0;
blackcount=0;
 
drawlinebyvillain(1,5,i,v1.x,v1.y,p1Width,p1Height,0,0,0,"black",255,0,0,"red");//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor 

drawlinebyplayer(1,5,i,p1X,p1Y,p1Width,p1Height,255,0,0,"red",0,0,0,"black");//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor

updateline(1,i,p1X,p1Y,v1.x,v1.y,"red","black");//gamelevel,i,px,py,vx,vy,playercolor,villaincolor

 noFill();//whole edge
stroke(0);
strokeWeight(5);
rect(width/2, height/2, width-2, height-2);

push();
stroke(0);//player
strokeWeight(2);
fill(255, 0, 0);
imageMode(CENTER);
image(player1,p1X, p1Y, p1Width, p1Height);
pop();

push();
stroke(255);//villain 
strokeWeight(2);
fill(0);
imageMode(CENTER)
image(villain1,v1.x, v1.y, p1Width, p1Height);
pop();


  
textSize(50)
noStroke()
if(t>3)
{
  fill(0,0,0);
}
else
{
  fill(255,0,0);
}
text(t,width/2-25,50);
if(blackcount>redcount)
{
  fill(0,0,255);
  text('blackcount: '+blackcount,width/2-330,50);
  fill(0,0,0);
  text('redcount: '+redcount,width/2+330,50);
}
else if(blackcount<redcount)
{
  fill(0,0,0);
text('blackcount: '+blackcount,width/2-330,50);
fill(0,0,255);
text('redcount: '+redcount,width/2+330,50);
}
else if(blackcount==redcount)
{
  fill(0,0,0);
text('blackcount: '+blackcount,width/2-330,50);
fill(0,0,0);
text('redcount: '+redcount,width/2+330,50);
}


// print("redcount="+redcount+" blackconut="+blackcount);
if(nowstatementP1 == "nothing")
{
  game1Item[1].display();
if((p1X+p1Width/2>=game1Item[1].x-game1Item[1].width/2)&&(p1X-p1Width/2<=game1Item[1].x+game1Item[1].width/2)&&(p1Y+p1Height/2>=game1Item[1].y-game1Item[1].height/2)&&(p1Y-p1Height/2<=game1Item[1].y+game1Item[1].height/2))
 {
 nowstatementP1="updown";
 clP=0;

 }
}

if(nowstatementV1 == "nothing")
{
  game1Item[2].display();
if((v1.x+p1Width/2>=game1Item[2].x-game1Item[2].width/2)&&(v1.x-p1Width/2<=game1Item[2].x+game1Item[2].width/2)&&(v1.y+p1Height/2>=game1Item[2].y-game1Item[2].height/2)&&(v1.y-p1Height/2<=game1Item[2].y+game1Item[2].height/2))
 {
 nowstatementV1="updown";
 clV=0;

 }
}
if(vilandplayer(p1X,p1Y,v1.x,v1.y,p1Width,p1Height)==false)
{
  stage=-1.1;
}
i++
}
function game1_again()
{
  print('game1agin'+redcount,blackcount);
  movepagecheck4=0;
 
  t=100;
  millischeck=0;
  previous_time1=0;
  current_time1=0;
  interval_time1=0;
  i=0;
  pastpX[0]=[];
  pastpY[0]=[];
  pastvX[0]=[];
  pastvY[0]=[];
  clP=0;
  clV=0;
  nowstatementP1 ="nothing";
  nowstatementV1 ="nothing";

  p1X=int(width*(4/5));
  p1Y=height-(Heightoftopbottom1+p1Height/2);

  v1.x=int(width*(1/5));
  v1.y=height-(Heightoftopbottom1+p1Height/2);
  background(255);
  if((blackcount>redcount)&&stage==1.5)
  {
    noStroke();
    fill(0,0,0);
    textSize(50)
    text('Villain is win!',width/2-20,height*(1/4));
  }
  else if((blackcount<redcount)&&stage==1.5)
  {
    noStroke();
    fill(255,0,0);
    textSize(50)
    text('Player is win!',width/2-20,height*(1/4));
  }
  else if((blackcount==redcount)&&stage==1.5)
  {
    noStroke();
    fill(0,50,70);
    textSize(50)
    text('OH...what are you doing?',width/2-20,height*(1/4));
  }
  else
  {
    noStroke();
    fill(30,50,70);
    textSize(50)
    text('No physical fight!',width/2-20,height*(1/4));
  }
  let fontsize4=(90, 90);
  buttontostage1again.position(width*(1/2)-270,height*(3/4)-50)
  buttontostage1again.size(540,100)
  buttontostage1again.style('font-size',fontsize4+'px')
  buttontostage1again.mousePressed(stageupto1);
  
}
function game1_end()
{
  print('game1end'+redcount,blackcount);
  movepagecheck4=0;
 
  t=100;
  millischeck=0;
  previous_time1=0;
  current_time1=0;
  interval_time1=0;
  i=0;
  pastpX[0]=[];
  pastpY[0]=[];
  pastvX[0]=[];
  pastvY[0]=[];
  clP=0;
  clV=0;
  nowstatementP1 ="nothing";
  nowstatementV1 ="nothing";

  p1X=int(width*(4/5));
  p1Y=height-(Heightoftopbottom1+p1Height/2);

  v1.x=int(width*(1/5));
  v1.y=height-(Heightoftopbottom1+p1Height/2);
  background(255);
  if((blackcount>redcount)&&stage==1.5)
  {
    noStroke();
    fill(0,0,0);
    textSize(50)
    text('Villain is win!',width/2-20,height*(1/4));
  }
  else if((blackcount<redcount)&&stage==1.5)
  {
    noStroke();
    fill(255,0,0);
    textSize(50)
    text('Player is win!',width/2-20,height*(1/4));
  }
  else if((blackcount==redcount)&&stage==1.5)
  {
    noStroke();
    fill(0,50,70);
    textSize(50)
    text('OH...what are you doing?',width/2-20,height*(1/4));
  }
  else
  {
    noStroke();
    fill(30,50,70);
    textSize(50)
    text('No physical fight!',width/2-20,height*(1/4));
  }
  let fontsize4=(90, 90);
  buttontostage1again.position(width*(1/2)-475,height*(3/4)-50)
  buttontostage1again.size(450,100)
  buttontostage1again.style('font-size',fontsize4+'px')
  buttontostage1again.mousePressed(stageupto1);

  let fontsize5=(90, 90);
  buttontostage2.position(width*(1/2)+75,height*(3/4)-50)
  buttontostage2.size(450,100)
  buttontostage2.style('font-size',fontsize5+'px')
  buttontostage2.mousePressed(stageupto2);
  
  
}
function game2()
{

  movepagecheck5=0;
  background (255);

box[2][0]=new Box(width/2,height/2, width*(3/5), height*(1/4),boximage2)//+width
box[2][1]=new Box(width/2, height/2, height*(1/4), height*(1/2),boximage2)//+height
box[2][2]=new Box(width*(2/7)*(1/2),height*(1/5)*(1/2),width*(2/7),height*(1/5),boximage2)//top
box[2][3]=new Box(width-width*(2/7)*(1/2),height-height*(1/5)*(1/2),width*(2/7),height*(1/5),boximage2)//bottom

//boxcount=4
box[2][0].display();
box[2][1].display();
box[2][2].display();
box[2][3].display();

thorn[2][0]=new Thorn(width*(1/50)*(1/2),height*(3/5),width*(1/50),height*(4/5),thorn_left);
thorn[2][1]=new Thorn(width-width*(1/50)*(1/2),height*(2/5),width*(1/50),height*(4/5),thorn_right);
thorn[2][2]=new Thorn(width*(2/7)+width*(5/14),width*(1/50)*(1/2),width*(5/7),width*(1/50),thorn_top);
thorn[2][3]=new Thorn(width*(5/14),height-width*(1/50)*(1/2),width*(5/7),width*(1/50),thorn_bottom);
//thorncount=4
thorn[2][0].display();
thorn[2][1].display();
thorn[2][2].display();
thorn[2][3].display();



game2Item[1]= new Item(width*(1/2)+width*(3/5)*(1/2)-20,height/2+height*(1/8)+20,40,40,item)//updown-player
game2Item[2]=new Item(width*(1/2)-width*(3/5)*(1/2)+20,height/2-height*(1/8)-20,40,40,item)//updown-villain

purplecount=0;//villain
greencount=0;//player

drawlinebyvillain(2,4,i,v2.x,v2.y,p1Width,p1Height,153,0,153,"purple",51,255,51,"green");//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor 

drawlinebyplayer(2,4,i,p2.x,p2.y,p1Width,p1Height,51,255,51,"green",153,0,153,"purple");//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor

updateline(2,i,p2.x,p2.y,v2.x,v2.y,"green","purple");//gamelevel,i,px,py,vx,vy,playercolor,villaincolor

 noFill();//whole edge
stroke(0);
strokeWeight(5);
rect(width/2, height/2, width-2, height-2);

push();
noStroke();//player
imageMode(CENTER);
image(player2,p2.x, p2.y, p1Width, p1Height);
pop();

push();
noStroke();//villain 
imageMode(CENTER)
image(villain2,v2.x, v2.y, p1Width, p1Height);
pop();


  
textSize(50)
noStroke()
if(t>3)
{
  fill(0,0,0);
}
else
{
  fill(255,0,0);
}
text(t,width/2-25,50);
if(purplecount>greencount)
{
  fill(0,0,255);
  text('purplecount: '+purplecount,width/2-310,50);
  fill(0,0,0);
  text('greencount: '+greencount,width/2+310,50);
}
else if(purplecount<greencount)
{
  fill(0,0,0);
text('purplecount: '+purplecount,width/2-310,50);
fill(0,0,255);
text('greencount: '+greencount,width/2+310,50);
}
else if(purplecount==greencount)
{
  fill(0,0,0);
text('purplecount: '+purplecount,width/2-310,50);
fill(0,0,0);
text('greencount: '+greencount,width/2+310,50);
}


// print("redcount="+redcount+" blackconut="+blackcount);
if(nowstatementP2 == "nothing")
{
  game2Item[1].display();
if((p2.x+p1Width/2>=game2Item[1].x-game2Item[1].width/2)&&(p2.x-p1Width/2<=game2Item[1].x+game2Item[1].width/2)&&(p2.y+p1Height/2>=game2Item[1].y-game2Item[1].height/2)&&(p2.y-p1Height/2<=game2Item[1].y+game2Item[1].height/2))
 {
 nowstatementP2="updown";
 clP=0;

 }
}

if(nowstatementV2 == "nothing")
{
  game2Item[2].display();
if((v2.x+p1Width/2>=game2Item[2].x-game2Item[2].width/2)&&(v2.x-p1Width/2<=game2Item[2].x+game2Item[2].width/2)&&(v2.y+p1Height/2>=game2Item[2].y-game2Item[2].height/2)&&(v2.y-p1Height/2<=game2Item[2].y+game2Item[2].height/2))
 {
 nowstatementV2="updown";
 clV=0;

 }
}
if(vilandplayer(p2.x,p2.y,v2.x,v2.y,p1Width,p1Height)==false)
{
  stage=-1.2;
}

if((checkthorn(2,p2.x,p2.y,4,p1Width,p1Height)==false)||(checkthorn(2,v2.x,v2.y,4,p1Width,p1Height)==false))
{
  stage=-1.3;
}
i++
}
function game2_again()
{
  movepagecheck4=0;
 
  t=100;
  millischeck=0;
  previous_time1=0;
  current_time1=0;
  interval_time1=0;
  i=0;
  pastpX[1]=[];
  pastpY[1]=[];
  pastvX[1]=[];
  pastvY[1]=[];
  clP=0;
  clV=0;
  nowstatementP2 ="nothing";
  nowstatementV2 ="nothing";

  p2.x=width/2+height*(1/8)+p1Width/2;
  p2.y=height/2+height*(1/8)+p1Height/2;

  v2.x=width/2-height*(1/8)-p1Width/2;
  v2.y=height/2-height*(1/8)-p1Height/2
  background(255);
  if((purplecount>greencount)&&stage==2.5)
  {
    noStroke();
    fill(153,0,153);
    textSize(50)
    text('Villain is win!',width/2-20,height*(1/4));
  }
  else if((purplecount<greencount)&&stage==2.5)
  {
    noStroke();
    fill(51,255,51);
    textSize(50)
    text('Player is win!',width/2-20,height*(1/4));
  }
  else if((purplecount==greencount)&&stage==2.5)
  {
    noStroke();
    fill(0,50,70);
    textSize(50)
    text('OH...what are you doing?',width/2-20,height*(1/4));
  }
  else if(stage==-1.2)
  {
    noStroke();
    fill(30,50,70);
    textSize(50)
    text('No physical fight!',width/2-20,height*(1/4));
  }
  else if(stage==-1.3)
  {
    noStroke();
    fill(30,50,70);
    textSize(50)
    text('OUCH!',width/2-20,height*(1/4));
  }
  let fontsize4=(90, 90);
  buttontostage2again.position(width*(1/2)-270,height*(3/4)-50)
  buttontostage2again.size(540,100)
  buttontostage2again.style('font-size',fontsize4+'px')
  buttontostage2again.mousePressed(stageupto2);
  
}
function game2_end()
{
  print('game2end'+redcount,blackcount);
  movepagecheck4=0;
 
  t=100;
  millischeck=0;
  previous_time1=0;
  current_time1=0;
  interval_time1=0;
  i=0;
  pastpX[1]=[];
  pastpY[1]=[];
  pastvX[1]=[];
  pastvY[1]=[];
  clP=0;
  clV=0;
  nowstatementP2 ="nothing";
  nowstatementV2 ="nothing";

  p2.x=width/2+height*(1/8)+p1Width/2;
  p2.y=height/2+height*(1/8)+p1Height/2;

  v2.x=width/2-height*(1/8)-p1Width/2;
  v2.y=height/2-height*(1/8)-p1Height/2
  background(255);
  if((purplecount>greencount)&&stage==2.5)
  {
    noStroke();
    fill(153,0,153);
    textSize(50)
    text('Villain is win!',width/2-20,height*(1/4));
  }
  else if((purplecount<greencount)&&stage==2.5)
  {
    noStroke();
    fill(51,255,51);
    textSize(50)
    text('Player is win!',width/2-20,height*(1/4));
  }
  else if((purplecount==greencount)&&stage==2.5)
  {
    noStroke();
    fill(0,50,70);
    textSize(50)
    text('OH...what are you doing?',width/2-20,height*(1/4));
  }
  else
  {
    noStroke();
    fill(30,50,70);
    textSize(50)
    text('No physical fight!',width/2-20,height*(1/4));
  }
  let fontsize4=(90, 90);
  buttontostage2again.position(width*(1/2)-475,height*(3/4)-50)
  buttontostage2again.size(450,100)
  buttontostage2again.style('font-size',fontsize4+'px')
  buttontostage2again.mousePressed(stageupto2);

  let fontsize5=(90, 90);
  buttontostage1.position(width*(1/2)+75,height*(3/4)-50)
  buttontostage1.size(450,100)
  buttontostage1.style('font-size',fontsize5+'px')
  buttontostage1.mousePressed(stageupto1);
  
}
function gamechange()
{
if((t<=0)&&stage==1)
{
  stage+=0.5;
}
if((t<=0)&&stage==2)
{
  stage+=0.5;
}
}
function drawlinebyplayer(g,b,i,x,y,w,h,r1,g1,b1,originalcolor,r2,g2,b2,opponentcolor)//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor
{

  push();//drawlinebyplayer
  noStroke();
  
  
  pastpX[g-1][i]=[x,originalcolor];
  pastpY[g-1][i]=[y,originalcolor];

 if(g==1)
 {
  if (nowstatementP1== "nothing")
  {
  nothingMoveP(g,x,y,b,w,h);
  }
  else if(nowstatementP1== "updown")
  {
  updownMoveP(g,x,y,b,w,h);
  }
 }
 else if(g==2)
 {
  if (nowstatementP2== "nothing")
  {
  nothingMoveP(g,x,y,b,w,h);
  }
  else if(nowstatementP2== "updown")
  {
  updownMoveP(g,x,y,b,w,h);
  }
 }
  
   
   for(let j=i; j>=0;j--)
   { if((pastpX[g-1][j][1]==originalcolor)&&(pastpY[g-1][j][1]==originalcolor))
      {
      push();
      fill(r1,g1,b1);
      ellipse(pastpX[g-1][j][0],pastpY[g-1][j][0],20,20);
      pop();
      if(stage==1)
      {
      redcount++
      }
      else if(stage==2)
      {
      greencount++
      }
      }
      else if((pastpX[g-1][j][1]==opponentcolor&&pastpY[g-1][j][1]==opponentcolor))
      {
        push();
        fill(r2,g2,b2);
        ellipse(pastpX[g-1][j][0],pastpY[g-1][j][0],20,20);
        pop();
        if(stage==1)
        {
        blackcount++
        }
        else if(stage==2)
        {
        purplecount++
        }
      }
     
   }
  
  
  pop();
}
function drawlinebyvillain(g,b,i,x,y,w,h,r1,g1,b1,originalcolor,r2,g2,b2,opponentcolor)//gamelevel,boxcount,i,x,y,width,height,originalcolor,opponentcolor
{

  push();
 
  noStroke();
 
 pastvX[g-1][i]=[x,originalcolor];//x,color
 pastvY[g-1][i]=[y,originalcolor];

 if(g==1)
 {
  if (nowstatementV1== "nothing")
  {
  nothingMoveV(g,x,y,b,w,h);
  }
  else if(nowstatementV1== "updown")
  {
  updownMoveV(g,x,y,b,w,h);
  }
 }
 else if(g==2)
 {
  if (nowstatementV2== "nothing")
  {
  nothingMoveV(g,x,y,b,w,h);
  }
  else if(nowstatementV2== "updown")
  {
  updownMoveV(g,x,y,b,w,h);
  }
 }
 
  for(let j=i; j>=0;j--)
  { if((pastvX[g-1][j][1]==originalcolor&&pastvY[g-1][j][1]==originalcolor))
     {
     push();
     fill(r1,g1,b1);
     ellipse(pastvX[g-1][j][0],pastvY[g-1][j][0],20,20);
     pop();
           if(stage==1)
        {
        blackcount++
        }
        else if(stage==2)
        {
        purplecount++
        }
     }
     else if((pastvX[g-1][j][1]==opponentcolor&&pastvY[g-1][j][1]==opponentcolor))
     {
       push();
       fill(r2,g2,b2);
       ellipse(pastvX[g-1][j][0],pastvY[g-1][j][0],20,20);
       pop();
       if(stage==1)
       {
       redcount++
       }
       else if(stage==2)
       {
       greencount++
       }
     }
    
  }
 pop();
}
function updateline(g,i,px,py,vx,vy,playercolor,villaincolor)//gamelevel,i,px,py,vx,vy,playercolor,villaincolor
{
  for(let p=i; p>=0; p--)
{
if(dist(px,py,pastvX[g-1][p][0],pastvY[g-1][p][0])<20)//black-->red
{
if(pastvX[g-1][p][1]==villaincolor&&pastvY[g-1][p][1]==villaincolor)
{
  pastvX[g-1][p][1]=playercolor;
  pastvY[g-1][p][1]=playercolor;

// (print('black to red'));
}
}

if(dist(px,py,pastpX[g-1][p][0],pastpY[g-1][p][0])<20)//black-->red
{
if(pastpX[g-1][p][1]==villaincolor&&pastpY[g-1][p][1]==villaincolor)
{
  pastpX[g-1][p][1]=playercolor;
  pastpY[g-1][p][1]=playercolor;
// (print('black to red'));
}
}
}
for(let k=i;k>=0;k--)
{
  if(dist(vx,vy,pastpX[g-1][k][0],pastpY[g-1][k][0])<20)//red-->black
{

  if(pastpX[g-1][k][1]==playercolor&&pastpY[g-1][k][1]==playercolor)
  {
pastpX[g-1][k][1]=villaincolor;
pastpY[g-1][k][1]=villaincolor;
// (print('red to black'));
  }
}
if(dist(vx,vy,pastvX[g-1][k][0],pastvY[g-1][k][0])<20)//red-->black
{

  if(pastvX[g-1][k][1]==playercolor&&pastvY[g-1][k][1]==playercolor)
  {
pastvX[g-1][k][1]=villaincolor;
pastvY[g-1][k][1]=villaincolor;
// (print('red to black'));
  }
}
}
}
function vilandplayer(px,py,vx,vy,w,h)
{
if(((px>=vx-w)&&(px<=vx+w))&&((py>=vy-h)&&(py<=vy+h)))
{
  return false;
}
else
{
  return true;
}
}
function nothingMoveP(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
  if(checkMove(g,x,y,c,w,h)==true)
  {
    movePR1();
    movePL1();
    // print('no tangnet'+x,y);
    
    }
    else{
      if ((checkMove(g,x-5,y,c,w,h)==true))
      {
        movePL1();
        // print('right tangent'+x,y);
      }
      else if ((checkMove(g,x+5,y,c,w,h)==true))
      {
        movePR1();
        // print('left tangent'+x,y);
      }
      else if ((checkMove(g,x,y-5,c,w,h)==true))
      {
        movePL1();
        movePR1();
        // print('bottomtangent'+x,y);
      }
      else if ((checkMove(g,x,y+5,c,w,h)==true))
      {
        movePL1();
        movePR1();
        // print('top tangent'+x,y);
      }
      else
      {
      if ((checkMove(g,x+5,y+5,c,w,h)==true))
      {
        movePR1();
        // print('top;left tangent'+x,y);
      }
      else if ((checkMove(g,x+5,y-5,c,w,h)==true))
      {
        movePR1();
        // print('bottom;left tangent'+x,y);
      }
      else if ((checkMove(g,x-5,y-5,c,w,h)==true))
      {
        movePL1();
        // print('bottom;right tangent'+x,y);
      }
      else if ((checkMove(g,x-5,y+5,c,w,h)==true))
      {
        movePL1();
        // print('top;right tangent'+x,y);
      }
    }
      
    }
  
}
function updownMoveP(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
if(checkMove(g,x,y,c,w,h)==true)
{
  movePR1();
  movePL1();
  flipPD1();
  flipPU1();
  // print('no tangnet'+x,y);
  
  }
  else{
    if ((checkMove(g,x-5,y,c,w,h)==true))
    {
      movePL1();
      flipPD1();
      flipPU1();
      // print('right tangent'+x,y);
    }
    else if ((checkMove(g,x+5,y,c,w,h)==true))
    {
      movePR1();
      flipPD1();
      flipPU1();
      // print('left tangent'+x,y);
    }
    else if ((checkMove(g,x,y-5,c,w,h)==true))
    {
      movePL1();
      movePR1();
      flipPU1();
      // print('bottomtangent'+x,y);
    }
    else if ((checkMove(g,x,y+5,c,w,h)==true))
    {
      movePL1();
      movePR1();
      flipPD1();
      // print('toptangent'+x,y);
    }
    else
    {
    if ((checkMove(g,x+5,y+5,c,w,h)==true))
    {
      movePR1();
      flipPD1();
      // print('top;left tangent'+x,y);
    }
    else if ((checkMove(g,x+5,y-5,c,w,h)==true))
    {
      movePR1();
      flipPU1();
      // print('bottom;left tangent'+x,y);
    }
    else if ((checkMove(g,x-5,y-5,c,w,h)==true))
    {
      movePL1();
      flipPU1();
      // print('bottom;right tangent'+x,y);
    }
    else if ((checkMove(g,x-5,y+5,c,w,h)==true))
    {
      movePL1();
      flipPD1();
      // print('top;right tangent'+x,y);
    }
  }
    
  }
} 
function nothingMoveV(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
  if(checkMove(g,x,y,c,w,h)==true)
  {
    moveVR1();
    moveVL1();
    print('no tangnet'+x,y);
    
    }
    else{
      if ((checkMove(g,x-5,y,c,w,h)==true))
      {
        moveVL1();
        print('right tangent'+x,y);
      }
      else if ((checkMove(g,x+5,y,c,w,h)==true))
      {
        moveVR1();
        // print('left tangent'+x,y);
      }
      else if ((checkMove(g,x,y-5,c,w,h)==true))
      {
        moveVL1();
        moveVR1();
        // print('bottomtangent'+x,y);
      }
      else if ((checkMove(g,x,y+5,c,w,h)==true))
      {
        moveVL1();
        moveVR1();
        // print('toptangent'+x,y);
      }
      else
      {
      if ((checkMove(g,x+5,y+5,c,w,h)==true))
      {
        moveVR1();
        // print('top;left tangent'+x,y);
      }
      else if ((checkMove(g,x+5,y-5,c,w,h)==true))
      {
        moveVR1();
        // print('bottom;left tangent'+x,y);
      }
      else if ((checkMove(g,x-5,y-5,c,w,h)==true))
      {
        moveVL1();
        // print('bottom;right tangent'+x,y);
      }
      else if ((checkMove(g,x-5,y+5,c,w,h)==true))
      {
        moveVL1();
        // print('top;right tangent'+x,y);
      }
    }
      
    }
  
}
function updownMoveV(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
if(checkMove(g,x,y,c,w,h)==true)
{
  moveVR1();
  moveVL1();
  flipVD1();
  flipVU1();
  // print('no tangnet'+x,y);
  
  }
  else{
    if ((checkMove(g,x-5,y,c,w,h)==true))
    {
      moveVL1();
      flipVD1();
      flipVU1();
      // print('right tangent'+x,y);
    }
    else if ((checkMove(g,x+5,y,c,w,h)==true))
    {
      moveVR1();
      flipVD1();
      flipVU1();
      // print('left tangent'+x,y);
    }
    else if ((checkMove(g,x,y-5,c,w,h)==true))
    {
      moveVL1();
      moveVR1();
      flipVU1();
      // print('bottomtangent'+x,y);
    }
    else if ((checkMove(g,x,y+5,c,w,h)==true))
    {
      moveVL1();
      moveVR1();
      flipVD1();
      // print('toptangent'+x,y);
    }
    else
    {
    if ((checkMove(g,x+5,y+5,c,w,h)==true))
    {
      moveVR1();
      flipVD1();
      // print('top;left tangent'+x,y);
    }
    else if ((checkMove(g,x+5,y-5,c,w,h)==true))
    {
      moveVR1();
      flipVU1();
      // print('bottom;left tangent'+x,y);
    }
    else if ((checkMove(g,x-5,y-5,c,w,h)==true))
    {
      moveVL1();
      flipVU1();
      // print('bottom;right tangent'+x,y);
    }
    else if ((checkMove(g,x-5,y+5,c,w,h)==true))
    {
      moveVL1();
      flipVD1();
      // print('top;right tangent'+x,y);
    }
  }
    
  }
} 
function checkMove(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
  let bn=0;
  let result=true;
  
do
{
if(checkingeachBox(g,bn,x,y,w,h)==true)
{
bn++
}
else
{
  result=false;
}
}
while((bn<c)&&(result==true));

return result;
}
function checkingeachBox(g,p,x,y,w,h)//gamenumber,boxnumber,x,y,width,height
{
    if(checkingLR(g,p,x,w)==true || checkingUD(g,p,y,h)== true)
  {
    return true;
  }
  else
  {
    return false;
  }
}
function checkingLR(g,n,x,w)//gamenumber,boxnumber,x,width
{
    if((x+w/2>=box[g][n].x-box[g][n].width/2)&&(x-w/2<=box[g][n].x+box[g][n].width/2))
    {
      return false;
    }
    else
    {
      return true;
    }
}
function checkingUD(g,i,y,h)//gamenumber,boxnumber,x,height
{
if((y+h/2>=box[g][i].y-box[g][i].height/2)&&(y-h/2<=box[g][i].y+box[g][i].height/2))
    {
      return false;
      
      
    }
    else
    {
      return true;
    }  
}
function checkthorn(g,x,y,c,w,h)//gamenumber,x,y,boxnumber,width,height
{
  let bn=0;
  let result=true;
  
do
{
if(checkingeachthorn(g,bn,x,y,w,h)==true)
{
bn++
}
else
{
  result=false;
}
}
while((bn<c)&&(result==true));

return result;
}
function checkingeachthorn(g,p,x,y,w,h)//gamenumber,boxnumber,x,y,width,height
{
    if(checkingthornLR(g,p,x,w)==true || checkingthornUD(g,p,y,h)== true)
  {
    return true;
  }
  else
  {
    return false;
  }
}
function checkingthornLR(g,n,x,w)//gamenumber,boxnumber,x,width
{
    if((x+w/2>=thorn[g][n].x-thorn[g][n].width/2)&&(x-w/2<=thorn[g][n].x+thorn[g][n].width/2))
    {
      return false;
    }
    else
    {
      return true;
    }
}
function checkingthornUD(g,i,y,h)//gamenumber,boxnumber,x,height
{
if((y+h/2>=thorn[g][i].y-thorn[g][i].height/2)&&(y-h/2<=thorn[g][i].y+thorn[g][i].height/2))
    {
      return false;
      
      
    }
    else
    {
      return true;
    }  
}
function keyPressed()
{
  if (keyCode== UP_ARROW)
  {
 
   clP++
    
  }
  if(key=='w')
  {
    clV++
  }
}
function movePL1()
{
  if (keyIsDown(LEFT_ARROW))
  {
    if(stage==1)
    {
      p1X-=5;
    }
    else if(stage==2)
    {
      p2.x-=5;
    }
    
  }
}
function movePR1()
{
  if (keyIsDown(RIGHT_ARROW))
  {
    if(stage==1)
    {
      p1X+=5;
    }
    else if(stage==2)
    {
      p2.x+=5;
    }
    
  }
}
function flipPU1()
{
if ((clP%2==1))
{
  if(stage==1)
    {
      p1Y-=5;
    }
    else if(stage==2)
    {
      p2.y-=5;
    }

}
}
function flipPD1()
{
if ((clP%2==0)&&(clP>0))
{
  if(stage==1)
    {
      p1Y+=5;
    }
    else if(stage==2)
    {
      p2.y+=5;
    }

}
}
function moveVL1()
{
  if (keyIsDown(97)||keyIsDown(65))
  {
    if(stage==1)
    {
      v1.x-=5;
    }
    else if(stage==2)
    {
      v2.x-=5;
    }
    
  }
}
function moveVR1()
{
  if (keyIsDown(100)||keyIsDown(68))
  {
    if(stage==1)
    {
      v1.x+=5;
    }
    else if(stage==2)
    {
      v2.x+=5;
    }
    
  }
}
function flipVU1()
{
if ((clV%2==1))
{
  if(stage==1)
    {
      v1.y-=5;
    }
    else if(stage==2)
    {
      v2.y-=5;
    }

}
}
function flipVD1()
{
if ((clV%2==0)&&(clV>0))
{
  if(stage==1)
    {
      v1.y+=5;
    }
    else if(stage==2)
    {
      v2.y+=5;
    }

}
}
function intro1()
{
background(255);
noStroke();
fill(0)
push();
textSize(100,100);
text('PAINTING KID',width*(1/2),height*(1/4));
pop();

push();
textSize(30);
text('Press any Button',width*(1/2),height-50);
pop();
if((keyIsPressed==true||mouseIsPressed==true)&&stage==0)
{
  stage=0.5;
  keyIsPressed=false;
  mouseIsPressed=false;
}

}
function intro2()
{
  background(255);

noStroke();
fill(0); // 
push();
textSize(70,70);
text('You are Player or Villain.',width*(1/2)-25,height*(1/4));
text('Make white background',width*(1/2)-25,height*(1/4)+90);
text('into your OWN COLOR!',width*(1/2)-25,height*(1/4)+180);
pop();

push();
textSize(30);
text('Press any Button',width*(1/2),height-50);
pop();
if((keyIsPressed==true||mouseIsPressed==true)&&stage==0.5)
{
  stage=0.7;
  keyIsPressed=false;
  mouseIsPressed=false;
}
}
function intro3()
{
  background(255);

noStroke();
fill(0);  
push();
textSize(70,70);
text('HOW TO PLAY',width*(1/2),height*(1/6));
pop();

push();
textSize(30,30);
text('-At first, you can only move <- or ->',width/2,height*(2/6));
text('->player use arrow key, villain use a,d key',width/2,height*(2/6)+40);
text('-If you eat Item, you can move up and down',width/2,height*(2/6)+80);
text('->player use arrow key, villain use w key',width/2,height*(2/6)+120);
text('*Create a circle in the past.',width/2,height*(2/6)+160);
text('If you touch the other one circle, it become your circle.',width/2,height*(2/6)+200);
text('If you make more circles, you win!',width/2,height*(2/6)+240);
pop();

push();
textSize(30);
text('Press any Button',width*(1/2),height-30);
pop();
if((keyIsPressed==true||mouseIsPressed==true)&&stage==0.7)
{
  stage=0.9;
  keyIsPressed=false;
  mouseIsPressed=false;
}
}
function startgame()
{
background(255);
  let fontsize1=(90, 90);
  button1.position(width*(1/4)-50,height*(1/2)-50)
  button1.size(100,100)
  button1.style('font-size',fontsize1+'px')

  let fontsize2=(90, 90);
  button2.position(width*(3/4)-50,height*(1/2)-50)
  button2.size(100,100)
  button2.style('font-size',fontsize2+'px')

  let fontsize3=(90, 90);
  button3.position(width*(1/2)-270,height*(3/4)-50)
  button3.size(540,100)
  button3.style('font-size',fontsize3+'px')
  
  button1.mousePressed(gototherealgame1);
  if(readytoU==true)
  {
    button2.mousePressed(gototherealgame2);
  }
  if(readytoREADY==true)
  {
    button3.mousePressed(stageupto1);
  }
}
function gototherealgame1()
{
readytoU=true;
// print(readytoU+0);
}
function gototherealgame2()
{
  readytoREADY=true;
  // print(readytoREADY+1);
}
function stageupto1()
{
  stage=1;
  button1.position(-400,-400);
  button2.position(-400,-400);
  button3.position(-400,-400);
  buttontostage1again.position(-400,-400);
  buttontostage2.position(-400,-400);
  buttontostage2again.position(-400,-400);
  buttontostage1.position(-400,-400);
}
function stageupto2()
{
  stage=2;
  button1.position(-400,-400);
  button2.position(-400,-400);
  button3.position(-400,-400);
  buttontostage1again.position(-400,-400);
  buttontostage2.position(-400,-400);
  buttontostage2again.position(-400,-400);
  buttontostage1.position(-400,-400);
}