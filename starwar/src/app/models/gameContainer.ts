import { Container, IApplicationOptions, Sprite } from "pixi.js";
export class GameContainer{
  background:Container;
  players:Container;
  enemies:Container;
  bullets:Container;
  constructor(gameScene:Container){
    this.background = new Container();
    this.players = new Container();
    this.enemies = new Container();
    this.bullets = new Container();
    gameScene.addChild(this.background);
    gameScene.addChild(this.players);
    gameScene.addChild(this.enemies);
    gameScene.addChild(this.bullets);
    this.playerInit();
  }
  public addEnemies( count:number) {
    for (let index = 0; index < count; index++) {
      const enemy = Sprite.from("../../../assets/resources/enemy.png");
      enemy.position.x = index * 50;
      enemy.position.y = 50;
      this.enemies.addChild(enemy);
    }
  }
  private playerInit(){
    const sprite = Sprite.from("../../../assets/resources/player.png");
    this.players.addChild(sprite);
  }

  public setPlayerPosition = (x:number,y:number) => {
    this.players.children[0].position.x = x;
    this.players.children[0].position.y = y;
  }
  public isWin  = () => this.enemies.children.length === 0;
  public isGameOver = (life:number) => life === 0;


  public enemiesMove(delay:number){
    for (const enemy of this.enemies.children) {
      enemy.position.y += 2 * delay;
      if (enemy.position.y > 500) {
        this.enemyiesPositionRestart(enemy);
      }
    }
  }

  enemyiesPositionRestart = (enemy:any) =>{enemy.position.y = 0}

  hasContact = (container1:any,container2:any) => container1.getBounds().intersects(container2.getBounds())

  isEnemyContactPlayer = ():boolean => {
    for (const enemy of this.enemies.children) {
      if (this.hasContact(enemy,this.players)) {
        return true;
      }
    }
    return false;
  }

  playerMove(keysMaps:any,delay:any,speed:any,iApplicationOptions:IApplicationOptions){
    if (keysMaps['ArrowLeft']) {
      if (iApplicationOptions.width && (this.players.children[0].position.x > 1)) {
        this.players.children[0].position.x -= speed * delay;
      }
    }
    if (keysMaps['ArrowRight']) {
      if (iApplicationOptions.width && (iApplicationOptions.width - this.players.children[0].position.x) > 35) {
        this.players.children[0].position.x += speed * delay;
      }
    }
    if (keysMaps['ArrowUp']) {
      if (iApplicationOptions.height && (this.players.children[0].position.y > 1)) {
      this.players.children[0].position.y -= delay * speed;
    }
  }
  if (keysMaps['ArrowDown']) {
      if (iApplicationOptions.height && (iApplicationOptions.height - this.players.children[0].position.y) > 50) {
        this.players.children[0].position.y += delay * speed;
      }
    }
  }

  bulletsMove(bulletSpeed:number,delay:number){
    for (const bullet of this.bullets.children) {
      bullet.position.y -= bulletSpeed * delay;
      if (bullet.position.y < 0) {
        this.bullets.removeChild(bullet);
        continue;
      }
      this.isBulettContactEnemies(bullet);
    }
  }

  isBulettContactEnemies(bullet:any){
    for (const enemy of this.enemies.children) {
      if (this.hasContact(enemy,bullet)) {
        this.enemies.removeChild(enemy);
      }
    }
  }

  createBullet(scale:number){
    const bullet = Sprite.from("../../../assets/resources/bullet.png");
    bullet.position.x = this.players.children[0].position.x;
    bullet.position.y = this.players.children[0].position.y;
    bullet.scale.x = scale;
    bullet.scale.y = scale;
    this.bullets.addChild(bullet);
  }

}
