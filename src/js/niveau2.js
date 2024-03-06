var plateformeniv2;
var groupe_ennemis;

export default class niveau2 extends Phaser.Scene {

  // constructeur de la classe
  constructor() {
    super({
      key: "niveau2" //  ici on précise le nom de la classe en tant qu'identifiant
    });
    //this.groupe_ennemis; // Déclaration de la variable groupe_ennemis
    this.flecheRecuperee = false;
  }

  preload() {
    // chargement tuiles de jeu
    this.load.image("Phaser_tuilesdejeu", "src/assets/tuilesJeu.png");
    this.load.image("sable", "src/assets/SAND.png");
    this.load.image("desert", "src/assets/Preview.png");
    this.load.image("herbe", "src/assets/Grass.png");
    this.load.image("img_coffre_ferme", "src/assets/coffre_ferme.png"); 

    this.load.image("img_coffre_ouvert", "src/assets/coffre_ouvert.png"); 

    this.load.image("fleche_arme", "src/assets/fleches.png"); 
    // chargement de la carte
    this.load.tilemapTiledJSON("carte", "src/assets/map2bis.json");
    this.load.image("img_ennemi", "src/assets/ennemi.png");
    console.log("preload done");
  }

  create() {
    // chargement de la carte
    const carteDuNiveau = this.add.tilemap("carte");

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


    console.log("before group ennemis");
    console.log("after ennemis done");
    this.checkNearbyChest();
    this.input.keyboard.on('keydown-A', () => { 

      if (this.physics.overlap(this.player, this.flechearme)) { 

        this.flechearme.destroy(); 

        this.flecheRécupérée = true; 

      } 

    }); 
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
      this.coffre_ouvert = this.physics.add.sprite(100, 280, "img_coffre_ouvert"); 
      this.coffre_ouvert.setScale(0.17); 
      this.coffre_ouvert.setCollideWorldBounds(true); 
      this.coffre_ouvert.body.setAllowGravity(false); 
      
      // Utilisez "fleche_arme" pour charger l'image de la flèche
      this.flechearme = this.physics.add.sprite(this.coffre_ouvert.x, this.coffre_ouvert.y, "fleche_arme"); 
      
      this.flechearme.setVisible(true); 
      this.flechearme.setCollideWorldBounds(true); 
      this.physics.add.collider(this.flechearme, this.groupe_plateformes); 
      this.physics.add.collider(this.flechearme, plateformeniv2); 
      this.flechearme.setVelocityY(-200); 
      
      if (!this.flecheRécupérée && this.physics.overlap(this.player, this.flechearme)) { 
          this.flecheRécupérée = true; // Définir la boule d'eau comme récupérée 
          this.flechearme.destroy(); // Détruire la boule d'eau 
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



tirerflecheJoueur() { 

  if (this.flecheRécupérée) { 

    const flecheArme = this.physics.add.sprite(this.player.x, this.player.y, "fleches"); 

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

} 



}

