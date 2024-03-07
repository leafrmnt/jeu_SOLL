import * as fct from "/src/js/fonctions.js";

/***********************************************************************/
/** VARIABLES GLOBALES 
/***********************************************************************/
var player; // désigne le sprite du joueur
var clavier; // pour la gestion du clavier
var groupe_plateformes;

// définition de la classe "selection"
export default class selection extends Phaser.Scene {
  constructor() {
    super({ key: "selection" }); // mettre le meme nom que le nom de la classe
  }

  /***********************************************************************/
  /** FONCTION PRELOAD 
/***********************************************************************/
  preload() {
    this.load.image("sol", "src/assets/Solmenu.png");
    this.load.image("fond", "src/assets/FondMenu.png");
    this.load.image("deco", "src/assets/Decomenu.png");
    this.load.spritesheet("img_perso", "src/assets/dude2.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image("img_porte1", "src/assets/door1.png");
    this.load.image("img_porte2", "src/assets/door2.png");
    this.load.image("img_porte3", "src/assets/door3.png");
    this.load.image("img_porte4", "src/assets/door4.png");
    this.load.image("regles", "src/assets/regle.png");
    this.load.tilemapTiledJSON("carte", "src/assets/Menu.json");

  }

  /***********************************************************************/
  /** FONCTION CREATE 
/***********************************************************************/

  create() {
    fct.doNothing();
    fct.doAlsoNothing();

    const carteDuNiveau = this.add.tilemap("carte");
    const tileset1 = carteDuNiveau.addTilesetImage("Solmenu", "sol");
    const tileset2 = carteDuNiveau.addTilesetImage("FondMenu", "fond");
    const tileset3 = carteDuNiveau.addTilesetImage("Decomenu", "deco");

    const Calquefond = carteDuNiveau.createLayer("Calquefond", tileset2);
    const Calquesol = carteDuNiveau.createLayer("Calquesol", [tileset1, tileset3]);
    const Calquedeco = carteDuNiveau.createLayer("Calquedeco", tileset3);

    Calquesol.setCollisionByProperty({ estSolide: true });

    /****************************
     *  Ajout des portes   *
     ****************************/
    this.porte1 = this.physics.add.staticSprite(470, 471, "img_porte1").setScale(0.7);
    this.porte2 = this.physics.add.staticSprite(800, 477, "img_porte2").setScale(0.7);
    this.porte3 = this.physics.add.staticSprite(1100, 474, "img_porte3").setScale(0.7);
    this.porte4 = this.physics.add.staticSprite(1430, 472, "img_porte4").setScale(0.7);


    this.add.text(445, 410, "Niveau 1", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "11pt"
    });
    this.add.text(778, 410, "Niveau 2", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "11pt"
    });
    this.add.text(1080, 410, "Niveau 3", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "11pt"
    });
    this.add.text(1390, 410, "Niveau Final", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "11pt"
    });
    // ajout nom jeu
    this.add.text(300, 100, "AUX ARMES PEUFIENS !", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "35pt"
    });

    /****************************
     *  CREATION DU PERSONNAGE  *
     ****************************/

    // On créée un nouveeau personnage : player
    player = this.physics.add.sprite(100, 450, "img_perso");

    //  propriétées physiqyes de l'objet player :
    player.setBounce(0.2); // on donne un petit coefficient de rebond
    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde
    this.physics.add.collider(player, Calquesol);

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
    // dans cette partie, on crée les animations, à partir des spritesheet
    // chaque animation est une succession de frame à vitesse de défilement défini
    // une animation doit avoir un nom. Quand on voudra la jouer sur un sprite, on utilisera la méthode play()
    // creation de l'animation "anim_tourne_gauche" qui sera jouée sur le player lorsque ce dernier tourne à gauche
    this.anims.create({
      key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 0,
        end: 3
      }), // on prend toutes les frames de img perso numerotées de 0 à 3
      frameRate: 10, // vitesse de défilement des frames
      repeat: -1 // nombre de répétitions de l'animation. -1 = infini
    });

    // creation de l'animation "anim_tourne_face" qui sera jouée sur le player lorsque ce dernier n'avance pas.
    this.anims.create({
      key: "anim_face",
      frames: [{ key: "img_perso", frame: 4 }],
      frameRate: 20
    });

    // creation de l'animation "anim_tourne_droite" qui sera jouée sur le player lorsque ce dernier tourne à droite
    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 5,
        end: 8
      }),
      frameRate: 10,
      repeat: -1
    });

    /***********************
     *  CREATION DU CLAVIER *
     ************************/
    // ceci permet de creer un clavier et de mapper des touches, connaitre l'état des touches
    clavier = this.input.keyboard.createCursorKeys();


    this.physics.world.setBounds(0, 0, 1600, 640);
    this.cameras.main.setBounds(0, 0, 1600, 640);
    this.cameras.main.startFollow(player);
    this.regles = this.add.image(400, 300, "regles");
    this.regles.setVisible(false);
    this.input.keyboard.on('keydown-R', this.toggleImage, this);
  }

  /***********************************************************************/
  /** FONCTION UPDATE 
/***********************************************************************/

  update() {

    if (clavier.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("anim_tourne_gauche", true);
    } else if (clavier.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("anim_tourne_droite", true);
    } else {
      player.setVelocityX(0);
      player.anims.play("anim_face");
    }

    if (clavier.up.isDown && player.body.blocked.down) {
      player.setVelocityY(-330);
    }
    if (Phaser.Input.Keyboard.JustDown(clavier.shift)) {
      if (this.physics.overlap(player, this.porte1))
        this.scene.switch("niveau1");
      if (this.physics.overlap(player, this.porte2))
        this.scene.switch("niveau2");
      if (this.physics.overlap(player, this.porte3))
        this.scene.switch("niveau3");
      if (this.physics.overlap(player, this.porte4))
        this.scene.switch("niveau4");
    }
    this.regles.setPosition(player.x, player.y - 200);

  }
  toggleImage() {
    this.regles.setVisible(!this.regles.visible);
    this.reglesOuverte = this.regles.visible;

  }
}
