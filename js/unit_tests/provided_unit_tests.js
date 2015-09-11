'use strict';

var expect = chai.expect;

describe('Provided unit tests', function() {
    var modelModule;

    beforeEach(function() {
        modelModule = createSceneGraphModule();
    });

    afterEach(function() {
        modelModule = null;
    })

    describe('carNode', function() {


        it('should have default height and width for car body', function() {
            var carNode = new modelModule.CarNode();
            var width = carNode.getWidth();
            expect(width != null).to.be.true;
            var height = carNode.getHeight();
            expect(height != null).to.be.true;
        });


        it('should be able to replace child node', function() {
           var carNode = new modelModule.CarNode();
           var fAxle = new modelModule.AxleNode('FRONT_AXLE_PART');
           var bAxle = new modelModule.AxleNode('BACK_AXLE_PART');

            carNode.addChild(fAxle);
            carNode.replaceGraphNode('FRONT_AXLE_PART',bAxle);

            expect(carNode.children != null).to.be.true;
        });

        it('should identify mouse position on car', function(){
            var carNode = new modelModule.CarNode();
            var temp = carNode.pointInObject({x:59,y:59});
            expect(temp == 0).to.be.true;
        });
    });

    describe('axleNode', function() {


        it('should have default height and width for axle', function() {
            var axleNode = new modelModule.AxleNode();
            var width = axleNode.getWidth();
            expect(width != null).to.be.true;
            var height = axleNode.getHeight();
            expect(height != null).to.be.true;
        });


        it('should never be selected', function(){
            var axleNode = new modelModule.AxleNode();
            var temp = axleNode.pointInObject({x:59,y:59});
            expect(temp == 0).to.be.true;
        });
    });

    describe('axleNode', function() {


        it('should have default height and width for tire', function() {
            var tireNode = new modelModule.TireNode();
            var width = tireNode.getWidth();
            expect(width != null).to.be.true;
            var height = tireNode.getHeight();
            expect(height != null).to.be.true;
        });


        it('should not modify height and width for tire ', function() {
            var tireNode = new modelModule.TireNode();
            tireNode.setWidth(100);
            var width = tireNode.getWidth();
            expect(width == 15).to.be.true;
            tireNode.setHeight(100);
            var height = tireNode.getHeight();
            expect(height == 40).to.be.true;
        });

        it('should have a default rotation matrix and its rotation matrix can be set', function(){
            var tireNode = new modelModule.TireNode();
            var temp = tireNode.getRotationM();
            expect(temp != null).to.be.true;
            var affT = new AffineTransform();
            affT.translate(2, 2);
            tireNode.setRotationM(affT);
            var temp2 = tireNode.getRotationM();
            expect(temp != temp2).to.be.true;
        });
    });
});
