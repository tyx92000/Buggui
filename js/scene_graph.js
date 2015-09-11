'use strict';

/**
 * A function that creates and returns the scene graph classes and constants.
 */
function createSceneGraphModule() {

    var mouseInverse = function(p, mtx) {
        var x,y;
        var inverse = mtx.createInverse();

        return {x:inverse.m00_*p.x + inverse.m01_*p.y + inverse.m02_,
        y:inverse.m10_*p.x + inverse.m11_*p.y + inverse.m12_};
    };

    // Part names. Use these to name your different nodes
    var CAR_PART = 'CAR_PART';
    var FRONT_AXLE_PART = 'FRONT_AXLE_PART';
    var BACK_AXLE_PART = 'BACK_AXLE_PART';
    var FRONT_LEFT_TIRE_PART = 'FRONT_LEFT_TIRE_PART';
    var FRONT_RIGHT_TIRE_PART = 'FRONT_RIGHT_TIRE_PART';
    var BACK_LEFT_TIRE_PART = 'BACK_LEFT_TIRE_PART';
    var BACK_RIGHT_TIRE_PART = 'BACK_RIGHT_TIRE_PART';

    var GraphNode = function() {
        this.height;
        this.width;
        this.posDown;
        this.posUp;
        this.matric; // origin to curr pos
        this.inverseMatric ; // curr pos to origin
    };

    _.extend(GraphNode.prototype, {

        /**
         * Subclasses should call this function to initialize the object.
         *
         * @param startPositionTransform The transform that should be applied prior
         * to performing any rendering, so that the component can render in its own,
         * local, object-centric coordinate system.
         * @param nodeName The name of the node. Useful for debugging, but also used to uniquely identify each node
         */
        initGraphNode: function(startPositionTransform, nodeName) {

            this.nodeName = nodeName;

            // The transform that will position this object, relative
            // to its parent
            this.startPositionTransform = startPositionTransform;

            // Any additional transforms of this object after the previous transform
            // has been applied
            this.objectTransform = new AffineTransform();

            // Any child nodes of this node
            this.children = {};

            // Add any other properties you need, here
        },

        addChild: function(graphNode) {
            this.children[graphNode.nodeName] = graphNode;
        },

        /**
         * Swaps a graph node with a new graph node.
         * @param nodeName The name of the graph node
         * @param newNode The new graph node
         */
        replaceGraphNode: function(nodeName, newNode) {
            if (nodeName in this.children) {
                this.children[nodeName] = newNode;
            } else {
                _.each(
                    _.values(this.children),
                    function(child) {
                        child.replaceGraphNode(nodeName, newNode);
                    }
                );
            }
        },

        /**
         * Render this node using the graphics context provided.
         * Prior to doing any painting, the start_position_transform must be
         * applied, so the component can render itself in its local, object-centric
         * coordinate system. See the assignment specs for more details.
         *
         * This method should also call each child's render method.
         * @param context
         */
        render: function(context) {
            // TODO: Should be overridden by subclass
        },

        /**
         * Determines whether a point lies within this object. Be sure the point is
         * transformed correctly prior to performing the hit test.
         */
        pointInObject: function(point) {
            // TODO: There are ways to handle this query here, but you may find it easier to handle in subclasses
        },

        setHeight: function(height){
            this.height = height;
        },

        setWidth: function(width){
            this.width = width;
        },

        getWidth: function(){
            return this.width ;
        },

        getHeight: function(){
            return this.height ;
        },

        setMousePositionDown: function(point){
            this.posDown = point;
        },

        setMousePositionUp: function(point){
            this.posUp = point;
        },

        setMatrix: function(matric){
            this.matric = matric;
        },

        setInverseMatrix: function(matric){
            this.inverseMatric = matric;
        },

        getMatrix: function(){
            return this.matric;
        },

        getInverseMatrix: function(){
            return this.inverseMatric;
        }
    });

    var CarNode = function() {
        this.initGraphNode(new AffineTransform(), CAR_PART)
        this.height = 170;
        this.width = 100;
        this.horizontalScale = this.width/2;
        this.verticalScale = this.height/2;
        this.matric = new AffineTransform(); // origin to curr pos
        this.inverseMatric =new AffineTransform(); // curr pos to origin
        this.rotationStartPoint;
        this.rotationM = new AffineTransform();
    };

    _.extend(CarNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function (context) {
            this.height = Math.abs(this.verticalScale)*2;
            this.width = Math.abs(this.horizontalScale)*2;

            if(this.height > 200){
                this.height = 200;
            }
            if(this.height < 50){
                this.height = 50;
            }
            if(this.width > 150){
                this.width = 150;
            }
            if(this.width < 25){
                this.width = 25;
            }

            var affT = new AffineTransform();
            //FRONT_AXLE_PART
            affT.translate(0, -this.height / 2 + 3 );
            var tempM = this.matric.clone(); // deep copy aft!!!!!!!!!!!
            tempM.concatenate(affT);
            this.children[FRONT_AXLE_PART].setMatrix(tempM);

            context.transform(
                affT.m00_,
                affT.m10_,
                affT.m01_,
                affT.m11_,
                affT.m02_,
                affT.m12_);

            var affTI = affT.createInverse();
            tempM = this.inverseMatric.clone();
            tempM.preConcatenate(affTI);
            this.children[FRONT_AXLE_PART].setInverseMatrix(tempM);
            this.children[FRONT_AXLE_PART].setCarLength(this.width);
            this.children[FRONT_AXLE_PART].render(context);

            context.transform(
                affTI.m00_,
                affTI.m10_,
                affTI.m01_,
                affTI.m11_,
                affTI.m02_,
                affTI.m12_);

            //BACK_AXLE_PART
            var affTB = new AffineTransform();
            affTB.translate(0, this.height / 2 -3 );
            tempM = this.matric.clone();
            tempM.concatenate(affTB);
            this.children[BACK_AXLE_PART].setMatrix(tempM);

            context.transform(
                affTB.m00_,
                affTB.m10_,
                affTB.m01_,
                affTB.m11_,
                affTB.m02_,
                affTB.m12_);

            var affTBI = affTB.createInverse();
            tempM = this.inverseMatric.clone();
            tempM.preConcatenate(affTBI);
            this.children[BACK_AXLE_PART].setInverseMatrix(tempM);
            this.children[BACK_AXLE_PART].setCarLength(this.width);
            this.children[BACK_AXLE_PART].render(context);

            context.transform(
                affTBI.m00_,
                affTBI.m10_,
                affTBI.m01_,
                affTBI.m11_,
                affTBI.m02_,
                affTBI.m12_);

            // body of the car
            context.beginPath();
            context.lineWidth = 0;
            context.fillStyle = "#31b0d5";
            context.fillRect((-1) * (this.width / 2), (-1) * (this.height / 2), this.width, this.height);
            context.strokeStyle = "#000000";
            context.strokeRect((-1) * (this.width / 2), (-1) * (this.height / 2), this.width, this.height);
            //rotation points
            context.fillStyle = "#e4b9b9";
            context.fillRect((-1) * (this.width / 2),  (this.height / 2)-15, 15, 15);
            context.fillRect( (this.width / 2)-15,  -(this.height / 2), 15, 15);
            //windows
            context.fillStyle = "#2e6da4";
            context.fillRect((-1)*(this.width / 2) + this.width*0.15, this.height / 2 -this.height*0.45, this.width*0.7, this.height*0.2);
            context.fillRect((-1)*(this.width / 2) + this.width*0.15, this.height / 2 -this.height*0.85, this.width*0.7, this.height*0.2);
            //lights
            context.beginPath();
            context.lineWidth = 2;
            context.fillStyle = "#ffff00";
            context.arc((-1)*(this.width / 2) + this.width*0.25, -this.height / 2 +this.height*0.06, this.height*0.05, 0, 2 * Math.PI);
            context.strokeStyle = "#ffffff";
            context.fill();
            context.stroke();
            context.beginPath();
            context.lineWidth = 2;
            context.arc((this.width / 2) - this.width*0.25, -this.height / 2 +this.height*0.06, this.height*0.05, 0, 2 * Math.PI);
            context.fill();
            context.stroke();


        },
        // Overrides parent method
        pointInObject: function(point) {
            var x = this.inverseMatric.m00_*point.x +this.inverseMatric.m01_*point.y + this.inverseMatric.m02_;
            var y = this.inverseMatric.m10_*point.x +this.inverseMatric.m11_*point.y + this.inverseMatric.m12_;

            if(x >= (-1)*this.width/2 && x <= this.width/2 &&
                y >=(-1)*this.height/2 && y <= this.height/2){
                    if((x >= this.width/2-20 && y <= (-1)*this.height/2 +20) ||
                        (x <= -this.width/2+20) && y >=this.height/2 -20 ){
                        return 4;
                    }
                    else if(x >= this.width/2-5 || x <= (-1)*this.width/2 + 5 ){return 2} // resize horizontally
                    else if(y <=(-1)*this.height/2 +5 || y >= this.height/2 -5){return 3}// resize vertically

                return 1;
            }
            //else{
            //    this.children[FRONT_AXLE_PART].children[FRONT_LEFT_TIRE_PART].pointInObject(point);
            //    this.children[FRONT_AXLE_PART].children[FRONT_RIGHT_TIRE_PART].pointInObject(point);
            //    this.children[BACK_AXLE_PART].children[BACK_LEFT_TIRE_PART].pointInObject(point);
            //    this.children[BACK_AXLE_PART].children[BACK_RIGHT_TIRE_PART].pointInObject(point);
            //    return false;
            //}
                return 0;
        },

        setHorizontalScale: function(point){
            this.horizontalScale = mouseInverse(point, this.matric).x;
        },

        setVerticalScale: function(point){
            this.verticalScale = mouseInverse(point, this.matric).y;
        },

        setRotationStartPoint: function(point){
            this.rotationStartPoint = point;
        },

        getRotationStartPoint: function(){
            return this.rotationStartPoint;
        },

        setRotationM: function(m){
            this.rotationM = m;
        },

        getRotationM: function(){
            return this.rotationM;
        }
    });

    /**
     * @param axlePartName Which axle this node represents
     * @constructor
     */
    var AxleNode = function(axlePartName) {
        this.initGraphNode(new AffineTransform(), axlePartName);
        this.height = 10;
        this.carWidth = 100;
        this.width = 100;
        this.offset = 10;
        //this.centerPos;
        this.matric =  new AffineTransform(); // origin to curr pos
        this.inverseMatric =  new AffineTransform(); // curr pos to origin
        this.posUp ={x: this.width/2+5, y:0 };
        this.axleDragged = 0;
    };

    _.extend(AxleNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {


            //if((this.posUp.x -this.posDown.x) >= 0 ){
            //    var newWidth =  (this.posUp.x -this.posDown.x)*2+this.width;
            //} else {
            //    var newWidth  = this.width -  (Math.abs(this.posUp.x -this.posDown.x)*2);
            //}
            if(this.axleDragged){
                this.offset = Math.abs(this.posUp.x*2) - this.width;
            }

            if(this.offset < 0){
                this.offset = 0;
            }
            if(this.offset > 150){
                this.offset = 150;
            }

            this.width = this.width + this.offset;

            context.fillStyle = "#228b22";
            context.fillRect( (-1)*(this.width /2),
                (-1)*(this.height/2), this.width  , this.height );
            context.fillStyle = "#000000";

           // var leftTire = this.children[FRONT_LEFT_TIRE_PART] || this.children[BACK_LEFT_TIRE_PART];
            //var rightTire = this.children[FRONT_LEFT_TIRE_PART] || this.children[BACK_LEFT_TIRE_PART];
            if(this.nodeName == FRONT_AXLE_PART){
                var leftTire = this.children[FRONT_LEFT_TIRE_PART];
                var rightTire = this.children[FRONT_RIGHT_TIRE_PART];
            } else {
                var leftTire = this.children[BACK_LEFT_TIRE_PART];
                var rightTire = this.children[BACK_RIGHT_TIRE_PART];
            }

            var affT = new AffineTransform();
            //Left tire
            affT.translate(-this.width /2, 0);
            var tempM = this.matric.clone();
            tempM.concatenate(affT);
            leftTire.setMatrix(tempM) ;

            context.transform(
                affT.m00_,
                affT.m10_,
                affT.m01_,
                affT.m11_,
                affT.m02_,
                affT.m12_);


            var affTI = affT.createInverse();
            tempM = this.inverseMatric.clone();
            tempM.preConcatenate(affTI);
            leftTire.setInverseMatrix(tempM) ;

            leftTire.render(context);

            context.transform(
                affTI.m00_,
                affTI.m10_,
                affTI.m01_,
                affTI.m11_,
                affTI.m02_,
                affTI.m12_);

            //Right tire
            var affTB = new AffineTransform();
            affTB.translate(this.width /2,0);
            tempM = this.matric.clone();
            tempM.concatenate(affTB);
            rightTire.setMatrix(tempM) ;

            context.transform(
                affTB.m00_,
                affTB.m10_,
                affTB.m01_,
                affTB.m11_,
                affTB.m02_,
                affTB.m12_);


            var affTBI = affTB.createInverse();
            tempM = this.inverseMatric.clone();
            tempM.preConcatenate(affTBI);
            rightTire.setInverseMatrix(tempM) ;

            rightTire.render(context);

            context.transform(
                affTBI.m00_,
                affTBI.m10_,
                affTBI.m01_,
                affTBI.m11_,
                affTBI.m02_,
                affTBI.m12_);
        },

        // Overrides parent method
        pointInObject: function(point) {
            // User can't select axles
            return false;
        },

        setMousePositionDown: function(point){
            this.posDown = mouseInverse(point, this.matric);
        },

        setMousePositionUp: function(point){
            this.posUp = mouseInverse(point, this.matric);
        },

        setCarLength: function(l){
            this.width = l;
        },

        setOffset: function(offset){
            this.offset = offset;
        },

        getWidth: function(){
            return this.width;
        },

        setFlag: function(bool){
            this.axleDragged = bool;
        }
    });

    /**
     * @param tirePartName Which tire this node represents
     * @constructor
     */
    var TireNode = function(tirePartName) {
        this.initGraphNode(new AffineTransform(), tirePartName);
        this.height = 40;
        this.width = 15;
        this.posDown;
        this.posUp;
        this.matric; // origin to curr pos
        this.inverseMatric; // curr pos to origin
        this.rotationStartPoint;
        this.rotationM = new AffineTransform();
    };

    _.extend(TireNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {

            var affT = new AffineTransform();
            affT.concatenate(this.rotationM);

            context.transform(
                affT.m00_,
                affT.m10_,
                affT.m01_,
                affT.m11_,
                affT.m02_,
                affT.m12_);


            var affTI = affT.createInverse();

            context.fillStyle = "#228b22";
            context.fillRect( (-1)*(this.width/2),(-1)*(this.height/2), this.width , this.height );
            context.fillStyle = "#000000";

            if(this.nodeName == FRONT_LEFT_TIRE_PART || this.nodeName == FRONT_RIGHT_TIRE_PART){
                //rotation points
                context.fillStyle = "#e4b9b9";
               // context.fillRect((-1) * (this.width / 2),  (this.height / 2)-10, this.width, 10);
                context.fillRect( (this.width / 2)-15,  -(this.height / 2), this.width, 15);
            }

            context.transform(
                affTI.m00_,
                affTI.m10_,
                affTI.m01_,
                affTI.m11_,
                affTI.m02_,
                affTI.m12_);


        },

        // Overrides parent method
        pointInObject: function(point) {
            var x = this.inverseMatric.m00_*point.x +this.inverseMatric.m01_*point.y + this.inverseMatric.m02_;
            var y = this.inverseMatric.m10_*point.x +this.inverseMatric.m11_*point.y + this.inverseMatric.m12_;

            if(x >= (-1)*this.width/2 && x <= this.width/2 &&
                y >=(-1)*this.height/2 && y <= this.height/2){
                    if(y <= (-1)*this.height/2+20 && this.nodeName == FRONT_LEFT_TIRE_PART){
                        return 2;
                    }else if(y <= (-1)*this.height/2+20 && this.nodeName == FRONT_RIGHT_TIRE_PART){
                        return 3;
                    }

                return 1;
            }
            return 0;
        },

        setRotationStartPoint: function(point){
            this.rotationStartPoint = point;
        },

        getRotationStartPoint: function(){
            return this.rotationStartPoint;
        },

        setRotationM: function(m){
            this.rotationM = m;
        },

        getRotationM: function(){
            return this.rotationM;
        },

        setHeight: function(height){
            //this.height = height;
        },

        setWidth: function(width){
            //this.width = width;
        }
    });

    // Return an object containing all of our classes and constants
    return {
        GraphNode: GraphNode,
        CarNode: CarNode,
        AxleNode: AxleNode,
        TireNode: TireNode,
        CAR_PART: CAR_PART,
        FRONT_AXLE_PART: FRONT_AXLE_PART,
        BACK_AXLE_PART: BACK_AXLE_PART,
        FRONT_LEFT_TIRE_PART: FRONT_LEFT_TIRE_PART,
        FRONT_RIGHT_TIRE_PART: FRONT_RIGHT_TIRE_PART,
        BACK_LEFT_TIRE_PART: BACK_LEFT_TIRE_PART,
        BACK_RIGHT_TIRE_PART: BACK_RIGHT_TIRE_PART
    };
}