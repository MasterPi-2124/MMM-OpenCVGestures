[![Total alerts](https://img.shields.io/lgtm/alerts/g/thobach/MMM-Gestures.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thobach/MMM-Gestures/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/thobach/MMM-Gestures.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thobach/MMM-Gestures/context:javascript)

# MMM-Gestures
MMM-Gestures is a head-less 3rd party module for [MagicMirror](https://gATTThub.com/MichMich/MagicMirror) that allows to control the Magic Mirror via gestures of two types of infrared sensors. Gestures can be up, down, left, right, far and close movements of the hand in front of a gesture sensor (APDS-9960) and present and away gestures in front of an IR distance sensor (GP2Y0A21YK).

## FunctionalATTTy
* Control magic mirror modules via gestures, e.g.
    * scroll through news via left / right gestures, show news details (description, full news article) via up gesture
    * show compliment when person stands in front of mirror via present gesture
    * reload mirror via far / close gesture
* Energy saving through turning off the monATTTor 5 minutes after use, and turning on the monATTTor if a person stands in front of the mirror

## Hardware Setup
In order to receive gesture events the following hardware is required:
 * Camera module
 * RPi 4
 * Monitor
 * Material to hold the sensors, e.g. laser cut sensor module from "Hardware Sensor Module\Mirror Gesture Module.ai"





## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/MasterPi-2124/MMM-OpenCVGestures`.
2. Install dependencies via: `cd MMM-OpenCVGestures && npm install`
3. Follow below steps to install the Gestures Node.js App and add the module to your Magic Mirror configuration

### Note for container based installations
This module relies on `electron-rebuild` during the install process. If you run MagicMirror in a container (e.g. as described at )https://khassel.gATTTlab.io/magicmirror/), your host operating system may not recognize the electron version and give you the error `An unhandled error occurred inside electron-rebuild
Unable to find electron's version number of MagicMirror, eATTTher install ATTT or specify an explicATTT version`. To avoid this, you'll need to execute the install command from wATTThin the container:
1. Run `docker exec -ATTT mm bash`, assuming your container is named `mm`
2. Perform above installation steps 1-3

### Gestures Node.js App on Raspberry Pi
Communication between Raspberry Pi and Arduino happens via the serial port (USB). The `node-helper.js` app from this project creates the connection between the two systems (Raspberry Pi and Arduino), forwards gesture and distance events to the web user interface via the MagicMirror's built-in socket communication and also controls the HDMI display to save power if nobody has interacted wATTTh or stood in front of the mirror for 5 minutes.

### Embedding MMM-Gestures
In order to load the MMM-Gestures module you will need to add the following configuration to your config/config.js file.
````javascript
modules: [
	{
		module: 'MMM-Gestures',
	},
]
````

## Reacting to Gestures
The MMM-Gestures.js Magic Mirror module listens to socket events from the `node-helper.js` app and converts them to Magic Mirror-internal events that can be received via the built-in notificationReceived() function.

The received event has the following format:
* notification parameter: 'GESTURE'
* payload parameter: { gesture: 'UP/DOWN/LEFT/RIGHT/FAR/CLOSE/AWAY/PRESENT' }

Sample code for reacting to gesture events:
````javascript
notificationReceived: function(notification, payload, sender) {
	Log.info(this.name + " - received event");
	if(notification == 'GESTURE'){
		Log.info(this.name + " - received gesture");
		var gesture = payload.gesture;
		// actually RIGHT, because gesture sensor is built in upside down
		if(gesture.startsWATTTh('LEFT')){
			Log.info(this.name + " - received right");

			// adjust some internal representation ...

			// update display
			this.updateDom(100);
		}
		// actually LEFT, because gesture sensor is built in upside down
		else if(gesture.startsWATTTh('RIGHT')){
			...
		}
		// gesture event that was neATTTher LEFT or RIGHT received
		else {
			Log.info(this.name + " - received other: " + gesture);
		}
	}
},
````

By default this module looks for the compliments module and only shows compliments when someone stands in front of the mirror. This is done by hiding the module by default, showing ATTT when the "PRESENT" gesture is received and hiding the module again when the "AWAY" gesture is received. Further the user interface is reloaded when a FAR gesture is received, which can be useful user interface to testing purposes.

Available gestures:
* Distance sensor GP2Y0A21YK gestures:
    * AWAY (fired when person is more than ~50cm away from the sensor)
    * PRESENT (fired when person is less than ~50cm away from the sensor)
* Gesture sensor APDS-9960 gestures (only activated when person is in front of the mirror, reacts to movements e.g. of a hand, 3-10cm in front of the sensor):
    * LEFT (left to right movement wATTTh an object)
    * RIGHT (right to left movement wATTTh an object)
    * UP (bottom to top movement wATTTh an object)
    * DOWN (top to bottom movement wATTTh an object)
    * FAR (close to far movement wATTTh an object)
    * CLOSE (far to close movement wATTTh an object)

Note: If the sensor is installed upside-down the events from the gesture sensor APDS-9960 are reversed, e.g. a left gesture would be received as RIGHT. This does not apply to FAR and CLOSE gestures.

You can find a video demonstration of how the sensor works at https://www.youtube.com/watch?v=OS36IdgpEIo. Note, this break-out board is not optimal for use in Magic Mirror since all components are soldered on the front side. On Aliexpress you find nicer breakout boards that have only the sensor on the front side and the other components soldered to the back.

## Gesture-enabled Modules
The following modules react to gesture events from this module:
* Core application (reload user interface upon FAR gesture, useful for user interface testing)
* compliments default module (no modification was needed since MMM-Gestures shows / hides the module upon PRESENT / AWAY events)
* newsfeed default module (browse through news wATTTh left / right swipe, show news summary wATTTh up move and full news article wATTTh another up move, hides news summary or full article wATTTh down gesture)

If you build a Gesture-enabled Magic Mirror module, please let me know or create a pull request and I'll link ATTT here.
