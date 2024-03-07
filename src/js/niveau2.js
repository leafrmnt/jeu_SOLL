var plateformeniv2;
var groupe_ennemis;
let ennemisTues = 0;
var coupDeLionel;


export default class niveau2 extends Phaser.Scene {

  // constructeur de la classe
  constructor() {
    super({
      key: "niveau2" //  ici on précise le nom de la classe en tant qu'identifiant
    });
    //this.groupe_ennemis; // Déclaration de la variable groupe_ennemis
    this.flecheRecuperee = false;
    this.coffre_ouvert = false; // Utilisé pour suivre l'état d'ouverture du coffre
    this.spriteCoffreOuvert = null; // Utilisé pour stocker la référence au sprite du coffre ouvert

  }

  preload() {
    // chargement tuiles de jeu
    this.load.image("Phaser_tuilesdejeu", "src/assets/tuilesJeu.png");
    this.load.image("sable", "src/assets/SAND.png");
    this.load.image("desert", "src/assets/Preview.png");
    this.load.image("herbe", "src/assets/Grass.png");
    this.load.image("img_coffre_ferme", "src/assets/coffre_ferme.png");
    this.load.image("img_porte3fin", "src/assets/doorniv3.png");
    this.load.image("img_coffre_ouvert", "src/assets/coffre_ouvert.png");
    this.load.image("fleche_arme", "src/assets/fleches.png");
    this.load.image("img_ennemi", "src/assets/ennemi.png");
    this.load.audio("lionel", "src/assets/Lionel.mp3");


    // chargement de la carte
    this.load.tilemapTiledJSON("carte2", "src/assets/map2bis.json");
    console.log("preload done");
  }

  create() {
    // chargement de la carte
    const carteDuNiveau = this.add.tilemap("carte2");

    // chargement du jeu de tuiles
    const tileset1 = carteDuNiveau.addTilesetImage("Preview", "desert");

    // chargement du jeu de tuiles
    const tileset2 = carteDuNiveau.addTilesetImage("SAND", "sable");
    const tileset3 = carteDuNiveau.addTilesetImage("tuilesJeu", "Phaser_tuilesdejeu");
    const tileset4 = carteDuNiveau.addTilesetImage("Grass", "herbe");

    // chargement du calque calque_background
    const calque_backgroundniv2 = carteDuNiveau.createLayer(" calque_background", tileset1);

    // Chargement du calque calque_background_2
    plateformeniv2 = carteDuNiveau.createLayer(
      "plateforme_niveau2",
      [tileset2, tileset3, tileset4] // Tableau de tous les tilesets nécessaires pour ce calque
    );

    // définition des tuiles de plateformes qui sont solides
    // utilisation de la propriété estSolide
    plateformeniv2.setCollisionByProperty({ estSolide: true });

    this.porte_fin = this.physics.add.staticSprite(3000, 68, "img_porte3fin");
    
    coupDeLionel = this.sound.add('lionel');


    groupe_ennemis = this.physics.add.group();


    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau 2", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });
    this.coffre_ferme = this.physics.add.sprite(100, 280, "img_coffre_ferme");

    this.coffre_ferme.setScale(0.20); // Réduire l'échelle de l'image de moitié 

    this.coffre_ferme.setCollideWorldBounds(true); // Permettre la collision avec les bords du monde 

    this.coffre_ferme.body.setAllowGravity(false); // Désactiver la gravité pour le coffre 

    this.physics.add.collider(this.coffre_ferme, this.groupe_plateformes); // Ajouter une collision avec les plateformes 

    this.resetChest(); // Réinitialiser l'état du coffre

    this.player = this.physics.add.sprite(50, 200, "img_perso");

    this.player.refreshBody();

    this.player.setBounce(0.2);

    this.player.setDepth(50);



    this.player.setCollideWorldBounds(true);

    this.player.body.onWorldBounds = true;
    // ajout d'une collision entre le joueur et le calque plateformes

    this.physics.add.collider(this.player, plateformeniv2);




    // redimentionnement du monde avec les dimensions calculées via tiled

    this.physics.world.setBounds(0, 0, 3200, 640);

    //  ajout du champs de la caméra de taille identique à celle du monde

    this.cameras.main.setBounds(0, 0, 3200, 640);

    // ancrage de la caméra sur le joueur

    this.cameras.main.startFollow(this.player);


    // on fait une boucle foreach, qui parcours chaque élements du tableau tab_points
    // Ajout des ennemis au groupe

    console.log("create done");
    this.clavier = this.input.keyboard.createCursorKeys();

    // extraction des poitns depuis le calque calque_ennemis, stockage dans tab_points
    const tab_points = carteDuNiveau.getObjectLayer("calque_ennemis");

    // on fait une boucle foreach, qui parcours chaque élements du tableau tab_points  
    tab_points.objects.forEach(point => {
      if (point.name == "ennemi") {
        var nouvel_ennemi = this.physics.add.sprite(point.x, point.y, "img_ennemi").setScale(3);
        groupe_ennemis.add(nouvel_ennemi);
      }
    });

    // par défaut, on va a gauche en utilisant la meme animation que le personnage
    groupe_ennemis.children.iterate(function iterateur(un_ennemi) {
      un_ennemi.setVelocityX(-40);
      un_ennemi.direction = "gauche";

    });
    this.physics.add.collider(groupe_ennemis, plateformeniv2);


    this.physics.add.collider(this.player, groupe_ennemis, this.playerEnnemiCollision, null, this);


  }



  update() {
    console.log(this);
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

      this.tirerflecheJoueur();

    }

    groupe_ennemis.children.iterate(function iterateur(un_ennemi) {
      if (un_ennemi.direction == "gauche" && un_ennemi.body.blocked.down) {
        var coords = un_ennemi.getBottomLeft();
        var tuileSuivante = plateformeniv2.getTileAtWorldXY(
          coords.x,
          coords.y + 10
        );
        if (tuileSuivante == null || un_ennemi.body.blocked.left) {
          // on risque de marcher dans le vide, on tourne
          un_ennemi.direction = "droite";
          un_ennemi.setVelocityX(40);

        }
      } else if (un_ennemi.direction == "droite" && un_ennemi.body.blocked.down) {
        var coords = un_ennemi.getBottomRight();
        var tuileSuivante = plateformeniv2.getTileAtWorldXY(
          coords.x,
          coords.y + 10
        );
        if (tuileSuivante == null || un_ennemi.body.blocked.right) {
          // on risque de marcher dans le vide, on tourne
          un_ennemi.direction = "gauche";
          un_ennemi.setVelocityX(-40);

        }

      }

    });


    this.checkNearbyChest();
    this.input.keyboard.on('keydown-A', () => {

      if (this.physics.overlap(this.player, this.flechearme)) {

        this.flechearme.destroy();

        this.flecheRécupérée = true;

      }

    });

    if (this.input.keyboard.addKey('A').isDown) {
      if (this.physics.overlap(this.player, this.fleche)) {
        this.pickupArrow(); // Appeler la fonction pour ramasser la flèche
      }
    }

    if (ennemisTues >= 2 && this.physics.overlap(this.player, this.porte_fin) && Phaser.Input.Keyboard.JustDown(this.clavier.shift)) {
      this.scene.switch("selection");
  }
    
  }

  playerEnnemiCollision(player, ennemi) {
    // Arrêtez le mouvement du joueur
    player.setVelocity(0);

    // Affichez un message ou une animation pour indiquer que le joueur est touché
    console.log('Le joueur est touché par un ennemi !');
    this.scene.restart();
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
      this.coffre_ouvert = true; // Maintenant, cela indique simplement l'état d'ouverture
      
      // Création et configuration du sprite du coffre ouvert (reste affiché aux mêmes dimensions)
      this.coffre_ouvert_sprite = this.add.sprite(this.coffre_ferme.x, this.coffre_ferme.y, "img_coffre_ouvert");
      this.coffre_ouvert_sprite.setScale(0.20); // Même échelle que le coffre fermé
      this.coffre_ouvert_sprite.setDepth(this.coffre_ferme.depth); // Même profondeur que le coffre fermé
      // Ajoutez d'autres configurations si nécessaire
      // ...
      
      // Création et configuration du sprite de la flèche
      this.fleche = this.physics.add.sprite(this.coffre_ouvert_sprite.x, this.coffre_ouvert_sprite.y, "fleche_arme");
      this.fleche.setScale(0.5); // Échelle de la flèche
      this.fleche.setCollideWorldBounds(true); // Permettre la collision avec les bords du monde
      this.fleche.body.setAllowGravity(true); // Activer la gravité pour la flèche
      
      // Ajout de la collision de la flèche avec plateformeniv2
      this.physics.add.collider(this.fleche, plateformeniv2);
    } 
  }
  
  // Quand vous réinitialisez le coffre
  resetChest() { 
    if (this.fleche) { 
      this.fleche.destroy(); // Détruire la flèche si elle existe
    } 
    
    if (this.coffre_ouvert_sprite) { 
      // Ne détruisez pas le sprite du coffre ouvert, laissez-le visible
    }
    
    this.coffre_ferme.setVisible(true); 
    this.coffre_ouvert = false; // Réinitialiser l'état d'ouverture
  }
  
  
  tirerflecheJoueur() {

    if (this.flecheRécupérée) {

      const flecheArme = this.physics.add.sprite(this.player.x, this.player.y, "fleche_arme");

      flecheArme.body.allowGravity = false;



      // Déterminez la direction dans laquelle le joueur est orienté 

      const directionX = this.clavier.right.isDown ? 1 : this.clavier.left.isDown ? -1 : 0;

      const directionY = this.clavier.down.isDown ? 1 : this.clavier.up.isDown ? -1 : 0;

      // Normalisez la direction pour éviter une vitesse plus rapide en diagonale 

      const norm = Math.sqrt(directionX * directionX + directionY * directionY);

      const velocityX = directionX / norm * 200;

      const velocityY = directionY / norm * 200;

      flecheArme.setVelocity(velocityX, velocityY);

      //console.log(groupe_ennemis); 

      this.physics.add.collider(flecheArme, groupe_ennemis, this.bouleToucheBoss, null, this);

    }

  }

  bouleToucheBoss(flecheArme, ennemi) {
    //console.log(bouleDeau); 
    console.log(" ");
    flecheArme.destroy();
    ennemi.destroy();
    ennemisTues++;
    coupDeLionel.play();
    //coupDeLionel.stop();
  }

  pickupArrow() {
    if (this.fleche && this.fleche.body && this.fleche.body.enable) {
      this.fleche.destroy(); // Détruire la flèche
      this.flecheRécupérée = true; // Définir la flèche comme récupérée
    }
  }

}

