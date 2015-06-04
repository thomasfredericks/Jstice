var cthree = cthree || {};

cthree = function() {

	var ready = true;

	var self = this;
	self.fullscreen = true;

	self.width;
	self.height;

	self.onUpdate;
	self.onLoaded;
	self.timestamp = 0;

    document.body.style.margin = '0px';
    document.body.style.padding = '0px';
    document.body.style.overflow = 'hidden';

		self.width = window.innerWidth;
		self.height = window.innerHeight;

		self.container = document.body;



		 //self.container.appendChild(self.canvas);

	  self.scene = new THREE.Scene();
    self.camera = new THREE.PerspectiveCamera( 75, self.width / self.height, 0.1, 1000 );
    self.renderer = new THREE.WebGLRenderer();

    self.renderer.setSize( self.width, self.height );
		//c3_debug(self.width+ " "+self.height);


		self.renderer.setClearColor( 0x333333	, 1 );
		self.container.appendChild( self.renderer.domElement );

		self.canvas = self.renderer.domElement;


   self.camera.position.z = 10;

    var resizeToWindow	= function(){



				var dirty = false;


				if (self.width != window.innerWidth) {
					self.width = window.innerWidth;
					dirty = true;
				}

				if (self.height != window.innerHeight) {
					self.height =  window.innerHeight;
					dirty  = true;
				}

				if ( dirty == true ) {

					// notify the renderer of the size change
					self.renderer.setSize( self.width, self.height );
					// update the camera
					self.camera.aspect	= self.width / self.height;
					self.camera.updateProjectionMatrix();

				}



			}

	resizeToWindow();

	function debug(msg) {
		console.log("cthree debug: "+msg);
	}

	var imagesToPreload = 0;
    var videosToPreload = 0;

    function checkReady() {


        if ( imagesToPreload == 0  && videosToPreload == 0 ) {
					ready = true;
					if ( self.onLoaded )	self.onLoaded();


				} else {
					ready = false;
				}
    }

    self.preloadImage = function (source) {

        imagesToPreload++;
        ready = false;

        var image = new Image();
        image.onload = function() {
            imagesToPreload--;
            checkReady();
        };
        image.src = source;

        return image;
    }

    self.preloadVideo = function (source) {

        videosToPreload++;
        ready = false;

        var video = document.createElement('video');
        video.oncanplay = function() {
            videosToPreload--;
            checkReady();
            video.oncanplay = null;
        };
        video.src = source;

        return video;

    }

	self.add = function(thing) {
		self.scene.add(thing);
		//cthree_debug("adding "+thing);
	}

	function update(timestamp) {
		requestAnimationFrame(update);

		if ( self.fullscreen) resizeToWindow();


		if (  ready ) {
            if ( self.onUpdate ) { // if ( self.onDraw && (self.animate || dirty ) ) {
                self.timestamp = timestamp;
								self.onUpdate();
										//console.log("render");
										// Render the scene
										self.renderer.render( self.scene, self.camera );

                //dirty = false;
            }
        } else {
					self.timestamp = timestamp;
					loadingIndicator.rotation.y = 	timestamp*0.0005;
					loadingIndicator.rotation.x = timestamp*0.00075;
					self.renderer.render( loadingScene, self.camera );

            console.log("preloading");
        }
	}

var loadingScene;
var loadingIndicator;
function createLoadingScene() {
	loadingScene = new THREE.Scene();

	var geometry = new THREE.TetrahedronGeometry(1,0);
	var material = new THREE.MeshBasicMaterial ( { color: 0xffffff, wireframe :true} );
	loadingIndicator =  new THREE.Mesh( geometry, material );

	//c3.scene.add(cube);
	loadingScene.add( loadingIndicator );


}


	self.start = function() {
		debug("start");
		createLoadingScene();
		checkReady();
		update(0);

	}


// MOUSE
// =======

self.mouseX = self.width*0.5;
self.mouseY = self.height*0.5;
self.mouseDown = false;


    function onMouseMove(event) {

			updateMouse(event.clientX,event.clientY);
       // Calculer la position 3D de la souris :



    }
		self.canvas.addEventListener('mousemove', onMouseMove , false);




    function onMouseDown(event) {
       // Sauvegarder la position de la souris lors d'un clique :

			self.mouseDown = true;
			updateMouse(event.clientX,event.clientY);
       // Calculer la position 3D de la souris :


    }
		self.canvas.addEventListener('mousedown', onMouseDown , false);

		function onMouseUp(event) {
			// Sauvegarder la position de la souris lors d'un clique :

			self.mouseDown = false;
			updateMouse(event.clientX,event.clientY);
			// Calculer la position 3D de la souris :


		}
		self.canvas.addEventListener('mouseup', onMouseUp , false);


function updateMouse(x,y) {
	self.mouseX = x;
	self.mouseY = y;

}


function pickingRay() {
/*
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );

	for ( var i = 0; i < intersects.length; i++ ) {

		intersects[ i ].object.material.color.set( 0xff0000 );

	}
	*/
}

var projector = new THREE.Projector();


self.screenCoordinatesToWorld= function(x,y,distance){

	var vector = new THREE.Vector3();

vector.set(
    ( x / window.innerWidth ) * 2 - 1,
    - ( y / window.innerHeight ) * 2 + 1,
    0.5 );

	return vectorToWorld(vector,distance);
}



self.normalizedCoordinatesToWorld = function (x,y,distance) {

	var vector = new THREE.Vector3();

   vector.set( x,y,0.5 );

	return vectorToWorld(vector,distance);
}

function vectorToWorld(vector,distance) {

  distance = Math.abs(distance);
	var plane =  new THREE.Plane(new THREE.Vector3(0, 0, 1), distance);
	plane.applyMatrix4(self.camera.matrixWorld);
	var raycaster = projector.pickingRay(vector, self.camera);
	return (raycaster.ray.intersectPlane(plane));//return raycaster.ray.intersectPlane(plane);

	//return new THREE.Vector3(0, 0, 0);

/*
projector.unprojectVector(vector, self.camera );

var dir = vector.sub( self.camera.position ).normalize();

var distance = - self.camera.position.z / dir.z;


// projects till z = 0, must fix for a certain distance
return self.camera.position.clone().add( dir.multiplyScalar( distance ) );

*/

	/* // alternate method with a plane
		var mv = new THREE.Vector3( (self.mouseX / window.innerWidth) * 2 - 1, -(self.mouseY / window.innerHeight) * 2 + 1,0.5 );
		var raycaster = projector.pickingRay(mv, self.camera);
		return raycaster.ray.intersectPlane(mousePlane);
		*/
}



	return self;


}
