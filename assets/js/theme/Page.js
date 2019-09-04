import PageManager from '../PageManager';

export default class Page extends PageManager {
    constructor() {
        super();
    }
}



/**
 * Calculator Module
 *      ~ Renders calculators for various content pages  
 * --------------------------------------------------------
 * 
 * HTML to call the module from a content page entry: 
 *  <div class="calculator" id="fireplaceCalculator">
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                TEAK.Modules.calculator.init({
                    id: "fireplaceCalculator",
                    type: "fireplace"
                });
            });
        </script>
    </div>
*
* TEAK.Modules.calculator.init({})
---------------------------------
* id        id of the element container to render the calculator
* type      the calculator type to rednder
*
*/

TEAK.Modules.calculator = {

    init: function(args){
        if( this.checkBeforeInit(args) ){ return; }

        this.settings = args; 
        this.settings.element = document.getElementById(this.settings.id);
        
        this.build();

        return this;
    },


    checkBeforeInit: function(args){
        try{
            if( !args.hasOwnProperty("id") || !args.hasOwnProperty("type") ){
                throw "TEAK Calculator Exception: Please define the type and/or the ID of the calculator to be rendered in TEAK.Modules.calculator.init().";
            }
        }
        catch(err){
            console.error(err);
            return err;
        }
    },


    build: function(){
        let tpl = this.templates[this.settings.type];

        this.settings.element.innerHTML = tpl;

        return this;
    },


    toggleFireplaceRadioControl: function(e){
        this.settings.calcName = e.target.value;

        this.settings.element.querySelector(".calculator__controlFigure--active").classList.remove("calculator__controlFigure--active")            
        
        $(this.settings.element).find("[type=radio]:checked")
            .parents(".calculator__controlFigure").addClass("calculator__controlFigure--active");

        this.settings.element.querySelectorAll(".calculator__titleName").forEach((element) => {
            element.innerHTML = this.settings.calcName;
        });

        document.getElementById("fireplaceButton").click();
    },


    calcFireplace: function(e){
        let calcForm = document.firePlaceCalculatorForm,
            width = parseInt(calcForm.fireplaceWidth.value),
            depth = parseInt(calcForm.fireplaceDepth.value),
            total = ((width * depth) * 4) / 30;

        total = parseInt(total);
        calcForm.calculatorTotal.value = this.settings.calcName !== "Lava Rock" ? total : total / 2;
        
        this.settings.element.querySelector(".calculator__totalCta").classList.remove("hide");

        e.preventDefault();
    },


    templates: {
        fireplace: `<form class="calculator__form" id="firePlaceCalculatorForm" name="firePlaceCalculatorForm" onsubmit="TEAK.Modules.calculator.calcFireplace(event)">
                        <fieldset class="calculator__fieldSet">
                            <legend class="calculator__title">
                                Fireplace <span class="calculator__titleName">Fireglass</span> Calculator
                            </legend>
                            
                            <div class="calculator__controls calculator__controls--short">
                                <div class="calculator__controlGroup">
                                    <h3 class="calculator__controlHeading">I'm using</h3>
                                </div>

                                <div class="calculator__controlGroup calculator__controlGroup--radioGroup">
                                    <label for="fireplaceFireGlass" class="calculator__controlLabel calculator__controlLabel--radioGroup">
                                        <figure class="calculator__controlFigure calculator__controlFigure--active">    
                                            <img class="calculator__controlImg" src="//cdn11.bigcommerce.com/s-r14v4z7cjw/products/351/images/44655/AFF-BRZRF12__00623.1495733246.270.270.jpg?c=2" alt="Fireglass">
                                            <input type="radio" checked name="fireplaceMaterial" id="fireplaceFireGlass" class="calculator__controlInput" value="Fireglass" onchange="TEAK.Modules.calculator.toggleFireplaceRadioControl(event)">
                                            <figcaption class="calculator__controlFigureText">Fireglass</figcaption>
                                        </figure>
                                    </label>

                                    <label for="fireplaceLavaRocks" class="calculator__controlLabel  calculator__controlLabel--radioGroup">
                                        <figure class="calculator__controlFigure">
                                            <img class="calculator__controlImg" src="//cdn11.bigcommerce.com/s-r14v4z7cjw/products/6514/images/56805/ATH-NL-3050__86806.1533818236.270.270.jpg?c=2" alt="Lava rocks">
                                            <input type="radio" name="fireplaceMaterial" id="fireplaceLavaRocks" class="calculator__controlInput" value="Lava Rock" onchange="TEAK.Modules.calculator.toggleFireplaceRadioControl(event)">
                                            <figcaption class="calculator__controlFigureText">Lava Rocks</figcaption>
                                        </figure>
                                    </label>
                                </div>

                                <div class="calculator__controlGroup">
                                    <label for="fireplceWidth" class="calculator__controlLabel">Fireplace Width</label>
                                    <input type="number" required placeholder="Inches" name="fireplaceWidth" id="fireplceWidth" class="calculator__controlInput">
                                </div>

                                <div class="calculator__controlGroup">
                                    <label for="fireplceDepth" class="calculator__controlLabel">Fireplace Depth</label>
                                    <input type="number" required placeholder="Inches" name="fireplaceDepth" id="fireplceDepth" class="calculator__controlInput">
                                </div>

                                <div class="calculator__controlGroup">
                                    <button type="submit" class="calculator__btn" id="fireplaceButton">Calculate</button>
                                </div>

                                <div class="calculator__controlGroup calculator__controlGroup--col">
                                    <p class="calculator__total">Total lbs. of <span class="calculator__titleName">Fireglass</span> needed: <output class="calculator__controlOutput" name="calculatorTotal" for="fireplceWidth fireplceDepth fireplceHeight">0</output></p>
                                    <p class="calculator__totalCta hide">Shop all <a href="/outdoor-heating/fireglass-lava-rocks/" title="shop fireglass" class="calculator__totalLink">Fireglass & Lava Rocks &rsaquo;</a></p>
                                </div>
                            </div>
                        </fieldset>
                    </form>`
    }
};