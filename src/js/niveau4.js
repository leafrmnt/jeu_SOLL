var calqueniv1;
export default class niveau4 extends Phaser.Scene {
  constructor() {
    super({
      key: "niveau4"
    });
  }

  preload() {
    this.load.image("Phaser_tuilesdejeu", "src/assets/red.png");
    this.load.image("Phaser_ciel", "src/assets/Nebula Red.png");
    this.load.image("Phaser_arbre", "src/assets/arbre.png");
    this.load.image("Phaser_boule_de_feu", "src/assets/fireball.png");
    this.load.image("img_coffre_ferme", "src/assets/coffre_ferme.png");
    this.load.image("img_coffre_ouvert", "src/assets/coffre_ouvert.png");
    this.load.image("boule_feu", "src/assets/boule_feu.png");
    this.load.image("boule_eau", "src/assets/boule_eau.png");
    this.load.image("couteau", "src/assets/couteau.png");
    this.load.image("dartiesdebut", "src/assets/dartiesdeb.png");
    this.load.image("image_victoire", "src/assets/dartiesfin.png");



    this.load.spritesheet("boss", "src/assets/boss.png", {
      frameWidth: 160,
      frameHeight: 128
    });
    this.load.tilemapTiledJSON("carte4", "src/assets/map4.json");
  }

  create() {
    //MAP//
    const carteDuNiveau = this.add.tilemap("carte4");
    const tileset1 = carteDuNiveau.addTilesetImage("red", "Phaser_tuilesdejeu");
    const tileset2 = carteDuNiveau.addTilesetImage("Nebula Red", "Phaser_ciel");
    const tileset3 = carteDuNiveau.addTilesetImage("arbre", "Phaser_arbre");
    const fondniv1 = carteDuNiveau.createLayer("fondniv1", tileset2);
    calqueniv1 = carteDuNiveau.createLayer("calqueniv1", tileset1);
    const arbre = carteDuNiveau.createLayer("arbre", tileset3);
    calqueniv1.setCollisionByProperty({ estSolide: true });
    this.add.text(400, 100, "Vous êtes dans le niveau final", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });

    //IMAGE DEBUT//
    this.dartiesdebutImage = this.add.image(300, 200, 'dartiesdebut');
    this.time.delayedCall(10000, this.fermerImage, [], this);

    //PORTE//
    this.porte_retour = this.physics.add.staticSprite(100, 530, "img_porte4");

    //
    this.coffre_ferme = this.physics.add.sprite(400, 530, "img_coffre_ferme");
    this.coffre_ferme.setScale(0.20);
    this.coffre_ferme.setCollideWorldBounds(true);
    this.coffre_ferme.body.setAllowGravity(false);
    this.physics.add.collider(this.coffre_ferme, this.groupe_plateformes);
    this.resetChest();

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.clavier = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, calqueniv1);

    this.anims.create({
      key: "animation_boss",
      frames: this.anims.generateFrameNumbers("boss", { start: 0, end: 3 }), // Utilisation des frames 0 à 7
      frameRate: 10,
      repeat: -1 // Répétition infinie de l'animation
    });

    this.monstre = this.physics.add.sprite(800, 300, "Phaser_face");
    this.monstre.setBounce(0.2);
    this.monstre.setScale(3); 
    this.monstre.setCollideWorldBounds(true);
    this.monstre.setSize(40, 60); // Définit la taille de la hitbox
    this.monstre.setOffset(60, 60); // Définit le décalage (offset) pour centrer la hitbox
    this.monstre.anims.play("animation_boss", true); // Lancement de l'animation dès la création du sprite
    this.physics.add.collider(this.monstre, calqueniv1);
    this.vieBoss = 30;

    this.physics.add.collider(this.player, calqueniv1);
    this.physics.world.setBounds(0, 0, 3200, 640);
    this.cameras.main.setBounds(0, 0, 3200, 640);
    this.cameras.main.startFollow(this.player);

    this.boulesDeFeu = this.physics.add.group({
      defaultKey: "Phaser_boule_de_feu",
      maxSize: -1,
      runChildUpdate: true
    });
    this.time.addEvent({
      delay: 3000,
      callback: this.tirerBouleDeFeu,
      callbackScope: this,
      loop: true
    });

    this.barreDeVie = this.add.graphics();
    this.majBarreDeVie();

    // Création d'un groupe pour les boules de feu du joueur
    this.boulesDeFeuJoueur = this.physics.add.group({
      defaultKey: "Phaser_boule_de_feu", 
      maxSize: -1, 
      runChildUpdate: true 
    });
    this.physics.add.collider(this.boulesDeFeuJoueur, this.monstre, this.bouleDeFeuToucheBoss, null, this);
  }

  tirerBouleDeFeu() {
    if (this.vieBoss <= 0) {
      // Si le boss est mort, sortir de la fonction sans tirer de boule de feu
      return;
    }

    const bouleDeFeu = this.boulesDeFeu.create(this.monstre.x, this.monstre.y, "Phaser_boule_de_feu");
    bouleDeFeu.setScale(0.01);
    bouleDeFeu.body.allowGravity = false;
    const directionX = this.player.x - this.monstre.x;
    const directionY = this.player.y - this.monstre.y;
    const norm = Math.sqrt(directionX * directionX + directionY * directionY);
    const velocityX = directionX / norm * 200;
    const velocityY = directionY / norm * 200;
    bouleDeFeu.setVelocity(velocityX, velocityY);
    this.physics.add.collider(bouleDeFeu, this.player, this.playerTouche, null, this);
  }


  playerTouche(bouleDeFeu, player) {
    console.log("Le joueur est touché par une boule de feu !");
    player.disableBody(true, true);
    this.time.delayedCall(2000, () => {
      player.enableBody(true, 100, 450, true, true);
    }, [], this);
  }

  tirerBouleDeFeuJoueur() {
    // Vérifiez si le boss est toujours défini et qu'il n'a pas été détruit
    if (this.monstre && this.monstre.body) {
      // Vérifiez si le joueur a récupéré la boule de feu du coffre
      if (this.bouleFeuRécupérée) {
        const bouleDeFeu = this.boulesDeFeu.create(this.player.x, this.player.y, "Phaser_boule_de_feu");
        bouleDeFeu.setScale(0.01);
        bouleDeFeu.body.allowGravity = false;

        // Déterminez la direction dans laquelle le joueur est orienté
        const directionX = this.clavier.right.isDown ? 1 : this.clavier.left.isDown ? -1 : 0;
        const directionY = this.clavier.down.isDown ? 1 : this.clavier.up.isDown ? -1 : 0;
        // Normalisez la direction pour éviter une vitesse plus rapide en diagonale
        const norm = Math.sqrt(directionX * directionX + directionY * directionY);
        if (norm !== 0) { // Assurez-vous que la direction n'est pas nulle pour éviter les valeurs NaN
          const velocityX = directionX / norm * 200;
          const velocityY = directionY / norm * 200;
          bouleDeFeu.setVelocity(velocityX, velocityY);
        }
        this.physics.add.collider(bouleDeFeu, this.monstre, this.bouleDeFeuToucheBoss, null, this);
      }
    }
  }



  bouleDeFeuToucheBoss(bouleDeFeu, boss) {
    this.vieBoss -= 1;
    this.majBarreDeVie();
    bouleDeFeu.destroy();
  }

  majBarreDeVie() {
    const largeurBarre = 200;
    const hauteurBarre = 20;
    // Position de la barre de vie au-dessus de la tête du boss
    const xBarre = this.monstre.x - largeurBarre / 2;
    const yBarre = this.monstre.y - 50;
    const yBarre = this.monstre.y - 50;
    this.barreDeVie.clear();
    this.barreDeVie.fillStyle(0xff0000);
    this.barreDeVie.fillRect(xBarre, yBarre, largeurBarre, hauteurBarre);
    const longueurVie = (this.vieBoss / 30) * largeurBarre;
    this.barreDeVie.fillStyle(0x00ff00);
    this.barreDeVie.fillRect(xBarre, yBarre, longueurVie, hauteurBarre);
  }


  update() {
    // Déplacements du joueur
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }
    // Saut du joueur
    if (this.clavier.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
    }

    // Tir de boules de feu par le joueur lorsque la touche espace est enfoncée
    if (Phaser.Input.Keyboard.JustDown(this.clavier.space)) {
      this.tirerBouleDeFeuJoueur();
    }

    // Retour à la sélection du niveau
    if (Phaser.Input.Keyboard.JustDown(this.clavier.shift)) {
      if (this.physics.overlap(this.player, this.porte_retour)) {
        console.log("niveau 3 : retour vers selection");
        this.scene.switch("selection");
      }
    }
    

    this.majBarreDeVie();
    if (this.vieBoss <= 0) {
    }

    // DEPLACEMENT BOSS VERS JOUEUR //
    const directionX = this.player.x - this.monstre.x;
    const directionY = this.player.y - this.monstre.y;
    // Normalisation de la direction
    const norm = Math.sqrt(directionX * directionX + directionY * directionY);
    // Vérification si le boss doit suivre le joueur
    const distanceMinimale = 600; // Distance minimale pour que le boss commence à suivre le joueur
    // Vérifiez si le boss est défini et a un corps avant de lui donner une vélocité
    if (this.monstre && this.monstre.body) {
      if (norm < distanceMinimale) {
        // Ajustement de la vélocité du boss pour qu'il se déplace vers le joueur
        const vitesse = 100; // Vitesse de déplacement du boss
        const velocityX = directionX / norm * vitesse;
        const velocityY = directionY / norm * vitesse;
        this.monstre.setVelocity(velocityX, velocityY);
      } else {
        // Arrêt du mouvement du boss s'il est trop loin du joueur
        this.monstre.setVelocity(0, 0);
      }
    }


    this.physics.world.collide(this.boulesDeFeuJoueur, this.monstre, this.bouleDeFeuToucheBoss, null, this);
    this.checkNearbyChest();

    // Récupération des objets lorsque la touche "A" est enfoncée
    this.input.keyboard.on('keydown-A', () => {
      if (this.physics.overlap(this.player, this.boule_feu)) {
        this.boule_feu.destroy();
        this.bouleFeuRécupérée = true;
      }
    });

  }
  checkNearbyChest() {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coffre_ferme.x, this.coffre_ferme.y);
    if (distance < 50 && !this.coffre_ouvert) {
      this.interactionCoffre();
    }
  }

  interactionCoffre() {

    if (!this.coffre_ouvert) {
      this.coffre_ferme.setVisible(false);
      this.coffre_ouvert = this.physics.add.sprite(400, 530, "img_coffre_ouvert");
      this.coffre_ouvert.setScale(0.17);
      this.coffre_ouvert.setCollideWorldBounds(true);
      this.coffre_ouvert.body.setAllowGravity(false);
      this.boule_feu = this.physics.add.sprite(this.coffre_ouvert.x, this.coffre_ouvert.y, "boule_feu");
      this.boule_feu.setVisible(true);
      this.boule_feu.setCollideWorldBounds(true);
      this.physics.add.collider(this.boule_feu, calqueniv1);
      this.boule_feu.setVelocityY(-200);
      if (!this.bouleFeuRécupérée && this.physics.overlap(this.player, this.boule_feu)) {
        this.bouleFeuRécupérée = true; 
        this.boule_feu.destroy(); 
      }
    }
  }

  resetChest() {
    if (this.coffre_ouvert) {
      this.coffre_ouvert.destroy();
      this.coffre_ouvert = null;
    }
    this.coffre_ferme.setVisible(true);
    this.coffre_ouvert = false;
  }

  fermerImage() {
    this.dartiesdebutImage.visible = false;
  }

  victoire() {
    this.monstre.destroy();
    const imageVictoire = this.add.image(this.monstre.x, this.monstre.y, 'image_victoire');
    imageVictoire.setOrigin(0.5, 0.5); 
    imageVictoire.setScale(1.5); 
    this.barreDeVie.clear();

  }

}
