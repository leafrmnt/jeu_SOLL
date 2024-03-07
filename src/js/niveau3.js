var plateformeniv3;
var groupe_ennemis;

export default class niveau3 extends Phaser.Scene {
  constructor() {
    super({
      key: "niveau3" 
    });
    this.tween_mouvement;
    this.plateforme_mobile;
    this.levier;
    this.bouleEauRecuperee = false;
  }
  preload() {
    this.load.image("Phaser_tuilesdejeu", "src/assets/jeu_de_tuile_niveau3.png");
    this.load.tilemapTiledJSON("carte3", "src/assets/map3.json");
    this.load.image("img_plateforme_mobile", "src/assets/tiny_blue_platform.png");
    this.load.image("img_levier", "src/assets/levier.png");
    this.load.image("img_porte3fin", "src/assets/door3.png");
    this.load.image("img_requin", "src/assets/requin.png");
    this.load.image("img_coffre_ferme", "src/assets/coffre_ferme.png");
    this.load.image("img_coffre_ouvert", "src/assets/coffre_ouvert.png");
    this.load.image("boule_eau", "src/assets/boule_eau.png");
    this.load.image("ericdeb", "src/assets/Eric_debut.png");
    this.load.image("ericfin", "src/assets/Eric_fin.png");
  }

  create() {
    const carteDuNiveau = this.add.tilemap("carte3");
    const tileset1 = carteDuNiveau.addTilesetImage(
      "jeu_de_tuile_niveau3",
      "Phaser_tuilesdejeu"
    );

    const fondniv3 = carteDuNiveau.createLayer(
      "Fond",
      tileset1
    );

    plateformeniv3 = carteDuNiveau.createLayer(
      "plateforme",
      tileset1
    );

    const deconiv3 = carteDuNiveau.createLayer(
      "deco",
      tileset1
    );

    // définition des tuiles de plateformes qui sont solides
    plateformeniv3.setCollisionByProperty({ estSolide: true });

    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau 3", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });
    this.ericdebImage = this.add.image(300, 200, 'ericdeb');
    this.time.delayedCall(10000, this.fermerImage, [], this);

    this.porte_fin = this.physics.add.staticSprite(3145, 60, "img_porte3fin");
    this.coffre_ferme = this.physics.add.sprite(270, 435, "img_coffre_ferme");
    this.coffre_ferme.setScale(0.20); // Réduire l'échelle de l'image de moitié
    this.coffre_ferme.setCollideWorldBounds(true); // Permettre la collision avec les bords du monde
    this.coffre_ferme.body.setAllowGravity(false); // Désactiver la gravité pour le coffre
    this.physics.add.collider(this.coffre_ferme, this.groupe_plateformes); // Ajouter une collision avec les plateformes
    this.resetChest(); // Réinitialiser l'état du coffre

    this.player = this.physics.add.sprite(50, 588, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setDepth(50);
    this.player.setCollideWorldBounds(true);
    this.player.body.onWorldBounds = true;
    // on met en place l'écouteur sur les bornes du monde
    // Dans la fonction de rappel de l'événement worldbounds
    this.player.body.world.on(
      "worldbounds", 
      (body, up, down, left, right) => {
        // on verifie si la hitbox qui est rentrée en collision est celle du player,
        // et si la collision a eu lieu sur le bord inférieur du player
        if (body.gameObject === this.player && down == true) {
          // Afficher un message pour indiquer que le joueur est mort
          const deathMessage = this.add.text(400, 300, "Vous êtes mort !", {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
          });
          deathMessage.setOrigin(0.5);
          // Mettre à jour la couleur du joueur
          this.player.setTint(0xff0000);
          // Retarder la renaissance du joueur pour un court instant
          this.time.delayedCall(1000, () => {
            // Supprimer le message de mort
            deathMessage.destroy();
            // Réinitialiser la couleur du joueur
            this.player.clearTint();
            // Réinitialiser la position du joueur à la position de départ
            this.restartSceneWithDelay(10);
            this.player.setPosition(50, 588);

          });
        }
      },
      this
    );
    this.plateforme_mobile = this.physics.add.sprite(
      3000,
      400,
      "img_plateforme_mobile"
    );
    this.plateforme_mobile.body.allowGravity = false; // Désactiver la gravité pour la plateforme
    this.plateforme_mobile.body.immovable = true; // Rendre la plateforme immobile
    this.physics.add.collider(this.player, this.plateforme_mobile);
    // Création du tween de mouvement
    this.tween_mouvement = this.tweens.add({
      targets: [this.plateforme_mobile], // on applique le tween sur plateforme_mobile
      paused: true, // de base le tween est en pause
      ease: "Linear", // concerne la vitesse de mouvement : linéaire ici
      duration: 15000, // durée de l'animation pour monter
      yoyo: true, // mode yoyo : une fois terminé on "rembobine" le déplacement
      y: "-=300", // on va déplacer la plateforme de 300 pixel vers le haut par rapport a sa position
      delay: 4000, // délai avant le début du tween une fois ce dernier activé
      hold: 1200, // délai avant le yoyo : temps que la plate-forme reste en haut
      repeatDelay: 1200, // deléi avant la répétition : temps que la plate-forme reste en bas
      repeat: -1 // répétition infinie
    });
    // Création du levier
    this.levier = this.physics.add.staticSprite(3100, 515, "img_levier");
    this.levier.active = false;
    this.clavier = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, this.groupe_plateformes);
    // ajout d'une collision entre le joueur et le calque plateformes
    this.physics.add.collider(this.player, plateformeniv3);
    // redimentionnement du monde avec les dimensions calculées via tiled
    this.physics.world.setBounds(0, 0, 3200, 640);
    //  ajout du champs de la caméra de taille identique à celle du monde
    this.cameras.main.setBounds(0, 0, 3200, 640);
    // ancrage de la caméra sur le joueur
    this.cameras.main.startFollow(this.player);
    // extraction des poitns depuis le calque calque_ennemis, stockage dans tab_points
    groupe_ennemis = this.physics.add.group();
    const tab_points = carteDuNiveau.getObjectLayer("calque_ennemis");
    // Création de la collision entre le joueur et les ennemis
    this.physics.add.collider(this.player, groupe_ennemis, this.playerEnemyCollision, null, this);
    // on fait une boucle foreach, qui parcours chaque élements du tableau tab_points  
    // Ajout des ennemis au groupe
    tab_points.objects.forEach(point => {
      if (point.name == "ennemi") {
        var nouvel_ennemi = this.physics.add.sprite(point.x, point.y, "img_requin");
        groupe_ennemis.add(nouvel_ennemi);
        nouvel_ennemi.setGravity(0); // Désactive la gravité pour l'ennemi
        nouvel_ennemi.body.allowGravity = false;
        nouvel_ennemi.setVelocityX(500); // Définit la vitesse horizontale pour aller à droite
      }
    });

    /*****************************************************
  *  ajout du modele de mobilite des ennemis *
  ******************************************************/
    // par défaut, on va a gauche en utilisant la meme animation que le personnage
    groupe_ennemis.children.iterate(function iterateur(un_ennemi) {
      un_ennemi.setVelocityX(-500);
      un_ennemi.setGravity(0);
      un_ennemi.direction = "gauche";
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
      this.player.setVelocityY(-330);
    }
    if (Phaser.Input.Keyboard.JustDown(this.clavier.space)) {
      this.tirerBouleEauJoueur();
    }
    // Autres actions à effectuer lors de l'appui sur la touche Shift
    if (this.physics.overlap(this.player, this.porte_fin) && Phaser.Input.Keyboard.JustDown(this.clavier.shift)) {
      // Affichez l'image "ercifin"
      this.ericfinImage = this.add.image(2900, 100, 'ericfin');
      // Ajoutez un délai de 5 secondes pour fermer l'image et changer de scène
      this.time.delayedCall(4000, () => {
        // Masquez l'image "ericfin"
        this.ericfinImage.visible = false;
        // Changez de scène
        this.scene.switch("selection");
      }, [], this);
    }

    if (this.physics.overlap(this.player, this.levier) && Phaser.Input.Keyboard.JustDown(this.clavier.shift)) {
      if (this.levier.active == true) {
        this.levier.active = false;
        this.levier.flipX = false;
        this.tween_mouvement.pause();
      } else {
        this.levier.active = true;
        this.levier.flipX = true;
        this.tween_mouvement.resume();
      }
    }

    groupe_ennemis.children.iterate(function (un_ennemi) {
      const distance = Phaser.Math.Distance.Between(un_ennemi.x, un_ennemi.y, this.player.x, this.player.y);
      if (distance < 400) {
        un_ennemi.setVelocityX(-500);
        un_ennemi.setVelocityY(0);
        un_ennemi.setGravity(0);
      } else {
        un_ennemi.setVelocity(0);
        un_ennemi.anims.stop();
      }
    }, this);

    this.physics.overlap(this.player, groupe_ennemis, this.playerEnemyCollision, null, this);
    this.checkNearbyChest();
    this.input.keyboard.on('keydown-A', () => {
      if (this.physics.overlap(this.player, this.bouleEau)) {
        this.bouleEau.destroy();
        this.bouleEauRécupérée = true;
      }
    });
  }

  playerEnemyCollision(player, enemy) {
    const deathMessage = this.add.text(400, 300, "Vous êtes mort !", {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    });
    deathMessage.setOrigin(0.5);
    this.player.setTint(0xff0000);
    groupe_ennemis.children.iterate((un_ennemi) => {
      un_ennemi.setVelocity(0);
      un_ennemi.anims.stop();
    });
    this.time.delayedCall(1000, () => {
      deathMessage.destroy();
      this.player.clearTint();
      this.restartSceneWithDelay(10);
      this.player.setPosition(50, 588);
    });
  }

  restartSceneWithDelay(delay) {
    this.timerRestart = this.time.delayedCall(delay, function () {
      this.scene.restart();
      this.resetChest();
    }, null, this);
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
      this.coffre_ouvert = this.physics.add.sprite(270, 435, "img_coffre_ouvert");
      this.coffre_ouvert.setScale(0.17);
      this.coffre_ouvert.setCollideWorldBounds(true);
      this.coffre_ouvert.body.setAllowGravity(false);
      this.bouleEau = this.physics.add.sprite(this.coffre_ouvert.x, this.coffre_ouvert.y, "boule_eau");
      this.bouleEau.setVisible(true);
      this.bouleEau.setCollideWorldBounds(true);
      this.physics.add.collider(this.bouleEau, this.groupe_plateformes);
      this.physics.add.collider(this.bouleEau, plateformeniv3);
      this.bouleEau.setVelocityY(-200);
      if (!this.bouleEauRécupérée && this.physics.overlap(this.player, this.bouleEau)) {
        this.bouleEauRécupérée = true; // Définir la boule d'eau comme récupérée
        this.bouleEau.destroy(); // Détruire la boule d'eau
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

  tirerBouleEauJoueur() {
    if (this.bouleEauRécupérée) {
      const bouleDeau = this.physics.add.sprite(this.player.x, this.player.y, "boule_eau");
      bouleDeau.body.allowGravity = false;
      // Déterminez la direction dans laquelle le joueur est orienté
      const directionX = this.clavier.right.isDown ? 1 : this.clavier.left.isDown ? -1 : 0;
      const directionY = this.clavier.down.isDown ? 1 : this.clavier.up.isDown ? -1 : 0;
      // Normalisez la direction pour éviter une vitesse plus rapide en diagonale
      const norm = Math.sqrt(directionX * directionX + directionY * directionY);
      const velocityX = directionX / norm * 200;
      const velocityY = directionY / norm * 200;
      bouleDeau.setVelocity(velocityX, velocityY);
      //console.log(groupe_ennemis);
      this.physics.add.collider(bouleDeau, groupe_ennemis, this.bouleToucheBoss, null, this);
    }
  }
  bouleToucheBoss(bouleDeau, ennemi) {
    //console.log(bouleDeau);
    console.log(" ");
    bouleDeau.destroy();
    ennemi.destroy();
  }
  fermerImage() {
    // Masquer l'image "ericdeb"
    this.ericdebImage.visible = false;
  }
  fermerErcifinImage() {
    // Masquez l'image "ericfin"
    this.ericfinImage.visible = false;
  }
}


