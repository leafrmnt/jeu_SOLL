var Tuiles_6;
var abdellafin;
export default class niveau1 extends Phaser.Scene {
  constructor() {
    super({
      key: "niveau1"
    });
    this.couteauRécupérée = false; 
    this.carteDuNiveau1 = null; // Declare carteDuNiveau1 variable
    this.groupe_ennemis = null; // Declare groupe_ennemis variable
  }

  preload() {
    // Load game tiles
    this.load.image("Phaser_tree1", "src/assets/bgrd_tree1.png");
    this.load.image("Phaser_tree4", "src/assets/bgrd_tree4.png");
    this.load.image("img_ours", "src/assets/ours.png");
    this.load.image("Phaser_rock", "src/assets/env_rock.png");
    this.load.image("Phaser_tree5", "src/assets/env_trees.png");
    this.load.image("Phaser_background", "src/assets/main_background.png");
    this.load.image("Phaser_sol", "src/assets/TX Tileset Ground.png");
    this.load.image("abdellah1", "src/assets/abdellah1.png");
    this.load.image("abdellah2", "src/assets/abdellah2.png");
    this.load.image("img_porte2", "src/assets/door2.png");
    this.load.image("couteau", "src/assets/couteau.png");
    
    this.load.image("img_coffre_ferme", "src/assets/coffre_ferme.png");
    this.load.image("img_coffre_ouvert", "src/assets/coffre_ouvert.png");
    this.load.audio("abdella", "src/assets/Abdella_bg.mp3");



    // Load the map
    this.load.tilemapTiledJSON("carte1", "src/assets/map52.json");
  }

  create() {
    // Load the map
    this.carteDuNiveau1 = this.add.tilemap("carte1");

    // Load tilesets
    const tileset1 = this.carteDuNiveau1.addTilesetImage("bgrd_tree1", "Phaser_tree1");
    const tileset2 = this.carteDuNiveau1.addTilesetImage("bgrd_tree4", "Phaser_tree4");
    const tileset4 = this.carteDuNiveau1.addTilesetImage("env_rock", "Phaser_rock");
    const tileset5 = this.carteDuNiveau1.addTilesetImage("env_trees", "Phaser_tree5");
    const tileset6 = this.carteDuNiveau1.addTilesetImage("main_background", "Phaser_background");
    const tileset7 = this.carteDuNiveau1.addTilesetImage("Phaser_sol", "Phaser_sol");

    // Create map layers
    const Tuiles_1 = this.carteDuNiveau1.createLayer("Tuiles_1", tileset6);
    const Tuiles_8 = this.carteDuNiveau1.createLayer("Tuiles_8", tileset2);
    const Tuiles_7 = this.carteDuNiveau1.createLayer("Tuiles_7", tileset1);
    const Tuiles_5 = this.carteDuNiveau1.createLayer("Tuiles_5", tileset5);
    const Tuiles_4 = this.carteDuNiveau1.createLayer("Tuiles_4", tileset4);
    Tuiles_6 = this.carteDuNiveau1.createLayer("Tuiles_6", tileset7);

    // Set collision properties for solid tiles
    Tuiles_6.setCollisionByProperty({ estSolide: true });

    // Add a distinctive level text
    this.add.text(400, 100, "Vous êtes dans le niveau 1", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });
    // Add a static sprite for the return door
    this.porte_retour2 = this.physics.add.staticSprite(3050, 430, "img_porte2");
    this.coffre_ferme = this.physics.add.sprite(260, 405, "img_coffre_ferme");
    this.coffre_ferme.setScale(0.20); // Réduire l'échelle de l'image de moitié
    this.coffre_ferme.setCollideWorldBounds(true); // Permettre la collision avec les bords du monde
    this.coffre_ferme.body.setAllowGravity(false); // Désactiver la gravité pour le coffre
    this.physics.add.collider(this.coffre_ferme, this.groupe_plateformes); // Ajouter une collision avec les plateformes
    this.resetChest(); // Réinitialiser l'état du coffre
    // Add player sprite
    this.player = this.physics.add.sprite(100, 400, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setDepth(50);
    this.player.setCollideWorldBounds(true);
    this.clavier = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, Tuiles_6);
    // Get the object layer for enemies
    const calque_ennemis = this.carteDuNiveau1.getObjectLayer("calque_ennemis");
    // Set world and camera bounds
    this.physics.world.setBounds(0, 0, 3200, 640);
    this.cameras.main.setBounds(0, 0, 3200, 640);
    this.cameras.main.startFollow(this.player);

    // Create a group for enemies
    this.groupe_ennemis = this.physics.add.group();

    // Ajouter une collision entre le joueur et les ennemis
    this.physics.add.collider(this.player, this.groupe_ennemis, this.playerToucheEnnemi, null, this);

    // Create enemies from object layer
    calque_ennemis.objects.forEach(point => {
      if (point.name === "ennemi") {
        console.log("ennemiCree")
        const randomVelocity = Phaser.Math.Between(40, 80); // Changer les valeurs selon votre besoin
        var nouvel_ennemi = this.groupe_ennemis.create(point.x, point.y, "img_ours");
        nouvel_ennemi.setVelocityX(-randomVelocity); // Utiliser la vitesse aléatoire
        nouvel_ennemi.direction = "gauche";
        nouvel_ennemi.setCollideWorldBounds(true);
        // Ajouter la gravité au monstre pour le faire sauter
        nouvel_ennemi.setGravityY(300);
        //nouvel_ennemi.play("anim_tourne_gauche", true);
      }
    });

    // Add collision between player and enemy layer
    this.physics.add.collider(this.groupe_ennemis, Tuiles_6);
    this.physics.add.collider(this.groupe_ennemis, this.player, this.playerToucheEnnemi, null, this);
    this.abdellah1 = this.add.image(145, 200, 'abdellah1');
    this.abdellah1.setScale(0.75);

    this.time.delayedCall(4500, this.fermerImage, [], this)
    abdellafin = this.sound.add('abdella');;

    // Créer des ennemis à partir de la couche d'objets
    calque_ennemis.objects.forEach(point => {
      if (point.name === "ennemi") {
        console.log("ennemiCree");
        const randomVelocity = Phaser.Math.Between(40, 80); // Changer les valeurs selon votre besoin
        var nouvel_ennemi = this.groupe_ennemis.create(point.x, point.y, "img_ours");
        nouvel_ennemi.setVelocityX(-randomVelocity); // Utiliser la vitesse aléatoire
        nouvel_ennemi.direction = "gauche";
        nouvel_ennemi.setCollideWorldBounds(true); // Ajouter une collision avec les bords du monde
        // Ajouter la gravité au monstre pour le faire sauter
        nouvel_ennemi.setGravityY(300);
        // Ajouter une collision entre le joueur et les ennemis
        this.physics.add.collider(this.player, nouvel_ennemi, this.playerToucheEnnemi, null, this);
      }
    });
  }

  update() {
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
    if (this.clavier.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-350);
    }
    if (this.physics.overlap(this.player, this.porte_retour2) && Phaser.Input.Keyboard.JustDown(this.clavier.shift)) {
      this.groupe_ennemis.setVelocityX(0);
      this.groupe_ennemis.setVelocityY(0);
      this.abdellah2 = this.add.image(2900, 300, 'abdellah2');
      abdellafin.play();
      // Ajoutez un délai de 5 secondes pour fermer l'image et changer de scène
      this.time.delayedCall(3000, () => {
        // Masquez l'image 
        this.abdellah2.visible = false;
        abdellafin.stop();
        // Changez de scène
        this.scene.switch("selection");
      }, [], this);
    }
    // Appeler la fonction pour tirer le couteau lorsque la touche correspondante est enfoncée
    if (Phaser.Input.Keyboard.JustDown(this.clavier.space)) {
      this.tirercouteauJoueur();
    }
    this.groupe_ennemis.children.iterate(ennemi => {
      // Déplacement horizontal de l'ennemi
      if (ennemi.direction === "gauche") {
        ennemi.setVelocityX(-40); // Déplacement vers la gauche
        ennemi.flipX = false; // Assure que l'image n'est pas inversée
      } else {
        ennemi.setVelocityX(40); // Déplacement vers la droite
        ennemi.flipX = true; // Inverse l'image pour faire face à droite
      }
      // Changement de direction de l'ennemi lorsqu'il atteint les bords
      if (ennemi.x <= 0) {
        ennemi.direction = "droite";
      } else if (ennemi.x >= 3200) {
        ennemi.direction = "gauche";
      }
      // Saut de l'ennemi
      const onGround = ennemi.body.blocked.down; // Vérifie si l'ennemi touche le sol
      if (onGround) {
        ennemi.setVelocityY(-250); // Applique une force de saut
      }
    });

    this.groupe_ennemis.children.iterate(ennemi => {
      // Calcul de la direction vers laquelle l'ennemi doit se déplacer
      const directionX = this.player.x - ennemi.x;
      const directionY = this.player.y - ennemi.y;
      // Normalisation du vecteur de direction
      const distance = Math.sqrt(directionX ** 2 + directionY ** 2);
      const velocity = 100; // Vitesse de déplacement de l'ennemi
      const normalizedDirectionX = (directionX / distance) * velocity;
      const normalizedDirectionY = (directionY / distance) * velocity;
      // Déplacement de l'ennemi vers le joueur
      ennemi.setVelocityX(normalizedDirectionX);
      ennemi.setVelocityY(normalizedDirectionY);
    });

    this.checkNearbyChest();
    this.input.keyboard.on('keydown-A', () => {
      if (this.physics.overlap(this.player, this.couteau)) {
        this.couteau.destroy();
        this.couteauRécupérée = true;
      }
    });
  }
  checkNearbyChest() {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coffre_ferme.x, this.coffre_ferme.y);
    if (distance < 50 && !this.coffre_ouvert) {
      this.interactionCoffre();
      this.couteauRécupérée = true; // Marquer le couteau comme récupéré lorsque le coffre est ouvert
    }
  }


  interactionCoffre() {
    if (!this.coffre_ouvert) {
      this.coffre_ferme.setVisible(false);
      this.coffre_ouvert = this.physics.add.sprite(260, 405, "img_coffre_ouvert");
      this.coffre_ouvert.setScale(0.17);
      this.coffre_ouvert.setCollideWorldBounds(true);
      this.coffre_ouvert.body.setAllowGravity(false);

      // Correction : Création du sprite de couteau à partir de l'emplacement du coffre
      this.couteau = this.physics.add.sprite(this.coffre_ouvert.x, this.coffre_ouvert.y, "couteau");
      this.couteau.setVisible(true);
      this.couteau.setCollideWorldBounds(true);
      this.physics.add.collider(this.couteau, this.groupe_plateformes);
      this.physics.add.collider(this.couteau, Tuiles_6);
      this.couteau.setVelocityY(-200);

      // Ajout de la condition pour récupérer le couteau
      if (!this.couteauRécupérée && this.physics.overlap(this.player, this.couteau)) {
        this.couteauRécupérée = true;
        this.couteau.destroy();
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

  playerToucheEnnemi(player, ennemi) {
    console.log("Le joueur est touché par une boule de feu !");
    this.player.setTint(0xff0000); // Optionnel : changer la teinte du joueur en rouge
    this.physics.pause(); // Mettre en pause la physique du jeu
    this.player.setVelocity(0, 0); // Arrêter le mouvement du joueur
    this.player.anims.play("anim_face"); // Optionnel : jouer l'animation d'arrêt du joueur
    this.time.delayedCall(1000, () => { // Redémarrer le niveau après 1 seconde
      this.player.clearTint(); // Optionnel : Réinitialiser la teinte du joueur
      this.scene.restart();
    });
  }

  tirercouteauJoueur() {
    if (this.couteauRécupérée) { // Ajouter cette vérification ici
      const couteau = this.physics.add.sprite(this.player.x, this.player.y, "couteau");
      couteau.body.allowGravity = false;
      const directionX = this.clavier.right.isDown ? 1 : this.clavier.left.isDown ? -1 : 0;
      const directionY = this.clavier.down.isDown ? 1 : this.clavier.up.isDown ? -1 : 0;
      const norm = Math.sqrt(directionX * directionX + directionY * directionY);
      const velocityX = directionX / norm * 200;
      const velocityY = directionY / norm * 200;
      couteau.setVelocity(velocityX, velocityY);
      this.physics.add.collider(couteau, this.groupe_ennemis, this.couteauToucheEnnemi, null, this);
    }
  }
  
  bouleToucheBoss(couteau, ennemi) {
    //console.log(bouleDeau);
    console.log(" ");
    couteau.destroy();
    ennemi.destroy();
  }
  couteauToucheEnnemi(couteau, ennemi) {
    couteau.destroy(); // Détruire le couteau
    ennemi.destroy(); // Détruire l'ennemi touché
  }

  fermerImage() {
    // Masquer l'image "abdellah1"
    this.abdellah1.visible = false;

  }
  fermerErcifinImage() {
    // Masquez l'image "ercifin"
    this.abdellah2.visible = false;
    // Redirigez le joueur vers la scène de sélection
  }
}