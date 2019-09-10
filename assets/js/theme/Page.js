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
 * HTML to call the module from a content page entry: Example call the Firepit calculator
 *  <div class="calculator" id="firepitCalculator">
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                TEAK.Modules.calculator.init({
                    id: "firepitCalculator",
                    type: "firepit"
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


    toggleFirepitRadioControl: function(e){
        this.settings.calcName = e.target.value;

        this.settings.element.querySelector(".calculator__controlFigure--active").classList.remove("calculator__controlFigure--active")            
        
        $(this.settings.element).find("[type=radio]:checked")
            .parents(".calculator__controlFigure").addClass("calculator__controlFigure--active");

        this.settings.element.querySelectorAll(".calculator__titleName").forEach((element) => {
            element.innerHTML = this.settings.calcName;
        });

        document.getElementById("firepitButton").click();
    },


    calcFirepit: function(e){
        let calcForm = document.firePitCalculatorForm,
            width = parseInt(calcForm.firepitWidth.value),
            depth = parseInt(calcForm.firepitDepth.value),
            total = ((width * depth) * 4) / 30;

        total = parseInt(total);
        calcForm.calculatorTotal.value = this.settings.calcName !== "Lava Rock" ? total : total / 2;
        
        this.settings.element.querySelector(".calculator__totalCta").classList.remove("hide");

        e.preventDefault();
    },


    templates: {
        firepit: `<form class="calculator__form" id="firePitCalculatorForm" name="firePitCalculatorForm" onsubmit="TEAK.Modules.calculator.calcFirepit(event)">
                        <fieldset class="calculator__fieldSet">
                            <legend class="calculator__title">
                                <span class="calculator__titleName">Fireglass</span> Calculator
                            </legend>
                            
                            <div class="calculator__controls calculator__controls--short">
                                <div class="calculator__controlGroup">
                                    <h3 class="calculator__controlHeading">Material</h3>
                                </div>

                                <div class="calculator__controlGroup calculator__controlGroup--radioGroup">
                                    <label for="firepitFireGlass" class="calculator__controlLabel calculator__controlLabel--radioGroup">
                                        <figure class="calculator__controlFigure calculator__controlFigure--active">    
                                            <img class="calculator__controlImg" src="//cdn11.bigcommerce.com/s-r14v4z7cjw/products/351/images/44655/AFF-BRZRF12__00623.1495733246.270.270.jpg?c=2" alt="Fireglass">
                                            <input type="radio" checked name="firepitMaterial" id="firepitFireGlass" class="calculator__controlInput" value="Fireglass" onchange="TEAK.Modules.calculator.toggleFirepitRadioControl(event)">
                                            <figcaption class="calculator__controlFigureText">Fireglass</figcaption>
                                        </figure>
                                    </label>

                                    <label for="firepitLavaRocks" class="calculator__controlLabel  calculator__controlLabel--radioGroup">
                                        <figure class="calculator__controlFigure">
                                            <img class="calculator__controlImg" src="//cdn11.bigcommerce.com/s-r14v4z7cjw/products/6514/images/56805/ATH-NL-3050__86806.1533818236.270.270.jpg?c=2" alt="Lava rocks">
                                            <input type="radio" name="firepitMaterial" id="firepitLavaRocks" class="calculator__controlInput" value="Lava Rock" onchange="TEAK.Modules.calculator.toggleFirepitRadioControl(event)">
                                            <figcaption class="calculator__controlFigureText">Lava Rocks</figcaption>
                                        </figure>
                                    </label>
                                </div>

                                <div class="calculator__controlGroup">
                                    <label for="fireplceWidth" class="calculator__controlLabel">Fire Pit Width</label>
                                    <input type="number" required placeholder="Inches" name="firepitWidth" id="fireplceWidth" class="calculator__controlInput">
                                </div>

                                <div class="calculator__controlGroup">
                                    <label for="fireplceDepth" class="calculator__controlLabel">Fire Pit Depth</label>
                                    <input type="number" required placeholder="Inches" name="firepitDepth" id="fireplceDepth" class="calculator__controlInput">
                                </div>

                                <div class="calculator__controlGroup">
                                    <button type="submit" class="calculator__btn" id="firepitButton">Calculate</button>
                                </div>

                                <div class="calculator__controlGroup calculator__controlGroup--col">
                                    <p class="calculator__total">Total lbs. of <span class="calculator__titleName">Fireglass</span> needed: <output class="calculator__controlOutput" name="calculatorTotal" for="firepitWidth firepitepth firepitHeight">0</output></p>
                                    <p class="calculator__totalCta hide">Shop all <a href="/outdoor-heating/fireglass-lava-rocks/" title="shop fireglass" class="calculator__totalLink">Fireglass & Lava Rocks &rsaquo;</a></p>
                                </div>
                            </div>
                        </fieldset>
                    </form>`
    }
};