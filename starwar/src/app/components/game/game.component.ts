import { Component, OnInit, ElementRef, NgZone, OnDestroy, Input, HostListener  } from '@angular/core';
import { Application,IApplicationOptions , Container, TextStyle, Text} from 'pixi.js';
import { GameContainer } from 'src/app/models/gameContainer';
import { GameState } from 'src/app/models/gameState';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit , OnDestroy {

  constructor(private elementRef: ElementRef,private ngZone: NgZone) {}

  private app?: Application;
  @Input()
  public applicationOptions: IApplicationOptions = {
    width: 600,
    height: 500,
    backgroundColor: 0xFF000
  };

  private state : GameState = GameState.MENU
  private gameScene = new Container();
  private mainScene = new Container();
  private menuScene = this.createScene("Start Game");


  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.app = new Application(this.applicationOptions);
    });
    this.elementRef.nativeElement.appendChild(this.app?.view);

    const updateScene = this.createGameScene(this.gameScene);

    this.mainScene.addChild(this.menuScene)
    this.menuScene.on('click', () => {
      this.state = GameState.PLAYING;
      this.app?.stage.removeChild(this.mainScene);
      this.app?.stage.addChild(this.gameScene);
    });

    this.app?.stage.addChild(this.mainScene);
    this.app?.ticker.add(
      (delay) => {
        if (this.state === GameState.PLAYING) {
          updateScene(delay);
        }else if (this.state === GameState.LOSE){
          this.app?.stage.removeChild(this.gameScene);
          this.app?.stage.addChild(this.createScene("Game Over"));
        }else if (this.state === GameState.WIN){
          this.app?.stage.removeChild(this.gameScene);
          this.app?.stage.addChild(this.createScene("You Win"));
        }
      }
    )
  }


  ngOnDestroy(): void {
    this.app?.destroy();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    this.keysMaps[event.code] = true;
    if (event.code === "Space") {
      this.isShootflag = true;
    }
  }
  @HostListener('document:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) {
    this.keysMaps[event.code] = false;
    if (event.code === "Space") {
      this.isShootflag = false;
    }
  }

  keysMaps:any = {};
  isShootflag:boolean = false;

  win = () => this.state = GameState.WIN;
  gameOver = () => this.state = GameState.LOSE;

  createGameScene(gameScene:any,config={enemyCount: 10,spawnSpeed:250,playerSpeed:10,bulletSpeed:15,life:3,lastBulletSpawnTime:0}) {
    const containers = new GameContainer(gameScene)
    containers.addEnemies(config.enemyCount)
    let {life,lastBulletSpawnTime} = config;
    const {spawnSpeed, playerSpeed, bulletSpeed} = config;
    containers.setPlayerPosition(300,400);

    return (delay:any) => {
      containers.playerMove(this.keysMaps,delay,playerSpeed,this.applicationOptions)
      if (this.isShootflag) {
        const currentTime = Date.now();
        if ((currentTime - lastBulletSpawnTime) > spawnSpeed) {
          containers.createBullet(0.25);
          lastBulletSpawnTime = currentTime;
        }
      }
      containers.bulletsMove(bulletSpeed,delay)

      containers.enemiesMove(delay);
      if (containers.isEnemyContactPlayer()) {
        containers.setPlayerPosition(300,400);
        life--;
      }
      if (containers.isGameOver(life)) {
        this.gameOver();
      }
      if(containers.isWin()){
        this.win();
      }
    };
  }


  createScene(text:string){
    const style = new TextStyle({ fill: "#00000", fontSize: 20 });
    const field = new Text(text, style);
    field.interactive = true;
    field.buttonMode = true;
    field.scale.x = 2;
    field.position.x = 275 - text.length * 7.75;
    field.position.y = 225;
    return field;
  }
}
