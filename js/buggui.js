'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var sceneGraphModule = createSceneGraphModule();
    var appContainer = document.getElementById('app-container');

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');

    appContainer.appendChild(canvas);
    var ctx = canvas.getContext('2d');



    ctx.canvas.height = 600;
    ctx.canvas.width = 800;
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(0,0, 800, 600);



    var carNode = new sceneGraphModule.CarNode();
    var frontAxle = new sceneGraphModule.AxleNode(sceneGraphModule.FRONT_AXLE_PART);
    var backAxle = new sceneGraphModule.AxleNode(sceneGraphModule.BACK_AXLE_PART);
    var frontLeftTire = new sceneGraphModule.TireNode(sceneGraphModule.FRONT_LEFT_TIRE_PART);
    var frontRightTire = new sceneGraphModule.TireNode(sceneGraphModule.FRONT_RIGHT_TIRE_PART);
    var backLeftTire = new sceneGraphModule.TireNode(sceneGraphModule.BACK_LEFT_TIRE_PART);
    var backRightTire = new sceneGraphModule.TireNode(sceneGraphModule.BACK_RIGHT_TIRE_PART);


    var documentBody = document.getElementById('app-container');

    carNode.addChild(frontAxle);
    carNode.addChild(backAxle);
    frontAxle.addChild(frontLeftTire);
    frontAxle.addChild(frontRightTire);
    backAxle.addChild(backLeftTire);
    backAxle.addChild(backRightTire);

    //frontAxle.setMousePositionDown({x:0,y:0});
    //frontAxle.setMousePositionUp({x:0,y:0});
    //backAxle.setMousePositionDown({x:0,y:0});
    //backAxle.setMousePositionUp({x:0,y:0});

    var affT = new AffineTransform();
    affT.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    carNode.setMatrix(affT);

    ctx.transform(
        affT.m00_,
        affT.m10_,
        affT.m01_,
        affT.m11_,
        affT.m02_,
        affT.m12_);



    var affTI = affT.createInverse();
    carNode.setInverseMatrix(affTI);
    carNode.render(ctx);



    ctx.transform(
        affTI.m00_,
        affTI.m10_,
        affTI.m01_,
        affTI.m11_,
        affTI.m02_,
        affTI.m12_);



    // mouse events
    var mouseIsDownOnCar;
    var mouseIsDownOnTire;
    canvas.addEventListener('mousedown', function(evt) {
        //var mousePos = getMousePos(canvas, evt);

        var pos = {x:0, y:0};
        pos.x = evt.pageX - canvas.offsetLeft;
        pos.y = evt.pageY - canvas.offsetTop;
        // console.log(pos.x,pos.y);


        mouseIsDownOnCar = carNode.pointInObject(pos);
        if(mouseIsDownOnCar == 4) {
            //documentBody.style.cursor = "ne-resize";
            carNode.setRotationStartPoint(pos);
        }

        mouseIsDownOnTire = frontLeftTire.pointInObject(pos) + frontRightTire.pointInObject(pos) +
        backLeftTire.pointInObject(pos) + backRightTire.pointInObject(pos);

        if(mouseIsDownOnTire == 2){
            frontLeftTire.setRotationStartPoint(pos);
        } else if(mouseIsDownOnTire == 3){
            frontRightTire.setRotationStartPoint(pos);
        }

    }, false);

    canvas.addEventListener('mouseup', function(evt) {
        documentBody.style.cursor = "default";

        var pos = {x:0, y:0};
        pos.x = evt.pageX - canvas.offsetLeft;
        pos.y = evt.pageY - canvas.offsetTop;


            mouseIsDownOnCar = 0;


        if(mouseIsDownOnTire){
            mouseIsDownOnTire = false;
        }

        console.log(pos.x,pos.y);
        //carNode.setMousePositionUp(pos);
    }, false);

    canvas.addEventListener('mousemove', function(evt){
        var pos = {x:0, y:0};
        pos.x = evt.pageX - canvas.offsetLeft;
        pos.y = evt.pageY - canvas.offsetTop;

        var mouseIsDownOnCar2 = carNode.pointInObject(pos);
        if(mouseIsDownOnCar2 == 1) {
            documentBody.style.cursor = "pointer";
        } else if(mouseIsDownOnCar2 == 2){
            documentBody.style.cursor = "col-resize";
        } else if(mouseIsDownOnCar2 == 3){
            documentBody.style.cursor = "row-resize";
        } else if(mouseIsDownOnCar2 == 4){
            documentBody.style.cursor = "all-scroll";
        }
        else {
            documentBody.style.cursor = "default";
        }

        var mouseIsDownOnTire2 = frontLeftTire.pointInObject(pos) + frontRightTire.pointInObject(pos) +
        backLeftTire.pointInObject(pos) + backRightTire.pointInObject(pos);
        if(mouseIsDownOnTire2 == 1) {
            documentBody.style.cursor = "col-resize";
        } else if(mouseIsDownOnCar2 == 2){
            documentBody.style.cursor = "all-scroll";
        }
        else {
            documentBody.style.cursor = "default";
        }

        if(mouseIsDownOnCar==1){
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            var affTNew = carNode.getMatrix().clone();

            affTNew.concatenate(carNode.getInverseMatrix().clone());
            affTNew.translate(pos.x,pos.y);
            affTNew.concatenate(carNode.getRotationM().clone());

            carNode.setMatrix(affTNew);
            var affTNewI = affTNew.createInverse();
            carNode.setInverseMatrix(affTNewI);
            ctx.transform(
                affTNew.m00_,
                affTNew.m10_,
                affTNew.m01_,
                affTNew.m11_,
                affTNew.m02_,
                affTNew.m12_);

            carNode.render(ctx);

            ctx.transform(
                affTNewI.m00_,
                affTNewI.m10_,
                affTNewI.m01_,
                affTNewI.m11_,
                affTNewI.m02_,
                affTNewI.m12_);

        } else if(mouseIsDownOnCar == 2){ //resize horizontally
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            carNode.setHorizontalScale(pos);

            var curM = carNode.getMatrix();
            ctx.transform(
                curM.m00_,
                curM.m10_,
                curM.m01_,
                curM.m11_,
                curM.m02_,
                curM.m12_);

            carNode.render(ctx);

            var currMI = carNode.getInverseMatrix();
            ctx.transform(
                currMI.m00_,
                currMI.m10_,
                currMI.m01_,
                currMI.m11_,
                currMI.m02_,
                currMI.m12_);
        } else if(mouseIsDownOnCar == 3){ //resize vertically
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            carNode.setVerticalScale(pos);

            var curM = carNode.getMatrix();
            ctx.transform(
                curM.m00_,
                curM.m10_,
                curM.m01_,
                curM.m11_,
                curM.m02_,
                curM.m12_);

            carNode.render(ctx);

            var currMI = carNode.getInverseMatrix();
            ctx.transform(
                currMI.m00_,
                currMI.m10_,
                currMI.m01_,
                currMI.m11_,
                currMI.m02_,
                currMI.m12_);
        } else if(mouseIsDownOnCar == 4){ //rotate
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            var thetaCurr = Math.atan2(((pos.y-carNode.getMatrix().m12_)),((pos.x-carNode.getMatrix().m02_)));
            var thetaInit = Math.atan2(((carNode.getRotationStartPoint().y-carNode.getMatrix().m12_)),((carNode.getRotationStartPoint().x-carNode.getMatrix().m02_)));

            var affTNew = new AffineTransform();

            //affTNew.translate(carNode.getInverseMatrix().m02_, carNode.getInverseMatrix().m12_);

            affTNew.translate(carNode.getMatrix().m02_, carNode.getMatrix().m12_);
            var rotM = new AffineTransform();
            rotM.rotate(-thetaInit+thetaCurr,0, 0);
            carNode.setRotationM(rotM);
            affTNew.concatenate(rotM);
            carNode.setMatrix(affTNew);
            ctx.transform(
                affTNew.m00_,
                affTNew.m10_,
                affTNew.m01_,
                affTNew.m11_,
                affTNew.m02_,
                affTNew.m12_);

            carNode.render(ctx);

            var currMI = affTNew.createInverse();
            carNode.setInverseMatrix(currMI);
            ctx.transform(
                currMI.m00_,
                currMI.m10_,
                currMI.m01_,
                currMI.m11_,
                currMI.m02_,
                currMI.m12_);
        }

        if(mouseIsDownOnTire == 1){ // drag
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
           // this.offset = this.posUp.x*2 - this.width;
            frontAxle.setFlag(1);
            backAxle.setFlag(1);
            frontAxle.setMousePositionUp(pos);
            backAxle.setMousePositionUp(pos);


            var curM = carNode.getMatrix();
            ctx.transform(
                curM.m00_,
                curM.m10_,
                curM.m01_,
                curM.m11_,
                curM.m02_,
                curM.m12_);

            carNode.render(ctx);

            frontAxle.setFlag(0);
            backAxle.setFlag(0);
            var currMI = carNode.getInverseMatrix();
            ctx.transform(
                currMI.m00_,
                currMI.m10_,
                currMI.m01_,
                currMI.m11_,
                currMI.m02_,
                currMI.m12_);
        } else if(mouseIsDownOnTire == 2){ // steer
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            var thetaCurr = Math.atan2(((pos.y-frontLeftTire.getMatrix().m12_)),((pos.x-frontLeftTire.getMatrix().m02_)));
            var thetaInit = Math.atan2(((frontLeftTire.getRotationStartPoint().y-frontLeftTire.getMatrix().m12_)),((frontLeftTire.getRotationStartPoint().x-frontLeftTire.getMatrix().m02_)));

            drawTires(-thetaInit+thetaCurr);
        } else if(mouseIsDownOnTire ==3){
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0,0, 800, 600);
            var thetaCurr = Math.atan2(((pos.y-frontRightTire.getMatrix().m12_)),((pos.x-frontRightTire.getMatrix().m02_)));
            var thetaInit = Math.atan2(((frontRightTire.getRotationStartPoint().y-frontRightTire.getMatrix().m12_)),((frontRightTire.getRotationStartPoint().x-frontRightTire.getMatrix().m02_)));

            drawTires(-thetaInit+thetaCurr);
        }


    },false);

    var drawTires = function(angle){
        if(angle > Math.PI/4){angle = Math.PI/4;}
        if(angle < -Math.PI/4){angle = (-Math.PI)/4}
        var affTNew = new AffineTransform();
        affTNew.translate(frontLeftTire.getMatrix().m02_, frontLeftTire.getMatrix().m12_);
        var rotM = new AffineTransform();
        rotM.rotate(angle,0, 0);
        frontLeftTire.setRotationM(rotM);
        affTNew.concatenate(rotM);
        frontLeftTire.setMatrix(affTNew);

        var affTNewR = new AffineTransform();
        affTNewR.translate(frontRightTire.getMatrix().m02_, frontRightTire.getMatrix().m12_);
        var rotM = new AffineTransform();
        rotM.rotate(angle,0, 0);
        frontRightTire.setRotationM(rotM);
        affTNewR.concatenate(rotM);
        frontRightTire.setMatrix(affTNewR);

        var currMI = affTNew.createInverse();
        frontLeftTire.setInverseMatrix(currMI);

        var currMIR = affTNewR.createInverse();
        frontRightTire.setInverseMatrix(currMIR);

        var curM = carNode.getMatrix();
        ctx.transform(
            curM.m00_,
            curM.m10_,
            curM.m01_,
            curM.m11_,
            curM.m02_,
            curM.m12_);

        carNode.render(ctx);

        var currMI = carNode.getInverseMatrix();
        ctx.transform(
            currMI.m00_,
            currMI.m10_,
            currMI.m01_,
            currMI.m11_,
            currMI.m02_,
            currMI.m12_);


    }
});