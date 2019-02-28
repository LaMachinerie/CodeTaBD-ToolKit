BotlyStudio.speedSlider = null;



BotlyStudio.initSlider = function(){
    var sliderSvg = document.getElementById('slider');
    BotlyStudio.speedSlider = new Slider(10, 35, 130, sliderSvg);
};