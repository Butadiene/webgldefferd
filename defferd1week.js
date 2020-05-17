//Bloom :https://qiita.com/edo_m18/items/c43177c0a18a2ea210b6
//lighiting :https://qiita.com/mebiusbox2/items/8a4734ab5b0854528789
// voronoi :https://neort.io/art/bpme7hc3p9fbkbq84460?index=26&origin=tag
var c,cw,ch,mx,my,wrapper;
  /**
     * @type {WebGLRenderingContext}
     */
var gl;
var startTime;
var time = 0.0;
var tempTime = 0.0;
var fps = 1000/30;
var uniLocation = new Array
	

window.onload = function(){
    var mrt_status ={
        color_attachments: 0,
        draw_buffers: 0
    };

    /**
     * @type {HTMLCanvasElement}
     */
    wrapper = document.getElementById('wrapper');
    c = document.getElementById('canvas');
   
    cw = wrapper.offsetWidth;
    ch = wrapper.offsetHeight;
    c.width = cw; c.height = ch;

    var SAMPLE_COUNT = 15;

    var offsetH = new Array(SAMPLE_COUNT);
    var weightH = new Array(SAMPLE_COUNT);
    {
        var offsetTmp = new Array(SAMPLE_COUNT);
        var total = 0;

        for (var i = 0; i < SAMPLE_COUNT; i++) {
            var p = (i - (SAMPLE_COUNT - 1) * 0.5) * 0.0006;
            offsetTmp[i] = p;
            weightH[i] = Math.exp(-p * p / 2) / Math.sqrt(Math.PI * 2);
            total += weightH[i];
        }
        for (var i = 0; i < SAMPLE_COUNT; i++) {
            weightH[i] /= total;
        }
        var tmp = [];
        for (var key in offsetTmp) {
            tmp.push(offsetTmp[key], 0);
        }
        offsetH = new Float32Array(tmp);
    }

    var offsetV = new Array(SAMPLE_COUNT);
    var weightV = new Array(SAMPLE_COUNT);
    {
        var offsetTmp = new Array(SAMPLE_COUNT);
        var total = 0;

        for (var i = 0; i < SAMPLE_COUNT; i++) {
            var p = (i - (SAMPLE_COUNT - 1) * 0.5) * 0.0006;
            offsetTmp[i] = p;
            weightV[i] = Math.exp(-p * p / 2) / Math.sqrt(Math.PI * 2);
            total += weightV[i];
        }
        for (var i = 0; i < SAMPLE_COUNT; i++) {
            weightV[i] /= total;
        }
        var tmp = [];
        for (var key in offsetTmp) {
            tmp.push(0, offsetTmp[key]);
        }
        offsetV = new Float32Array(tmp);
    }


    gl = c.getContext('webgl')||c.getContext('experimental-webgl');
    
    
    var ext = gl.getExtension('WEBGL_draw_buffers');
    var extf = gl.getExtension('OES_texture_float');
    if(!ext){
        alert('WEBGL_draw_buffers not supported');
        return;
    }else{

        mrt_status.color_attachments = gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL);
        mrt_status.draw_buffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
        console.log('MAX_COLOR_ATTACHMENTS_WEBGL: '+mrt_status.color_attachments);
        console.log('MAX_DRAW_BUFFER_WEBGL: '+ mrt_status.draw_buffers);
    }

    gl.clearColor(0.0,0.0,0.0,1.0);

    gl.clearDepth(1.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    var prg = create_program(v_shader,f_shader);
    uniLocation[0] = gl.getUniformLocation(prg, 'time');
    uniLocation[1] = gl.getUniformLocation(prg,'resolution');
    uniLocation[2] = gl.getUniformLocation(prg,'campos');
    var attLocation = [];
    attLocation[0] = gl.getAttribLocation(prg,'position');

    var attStride = [];
    attStride[0] = 3;


    v_shader = create_shader('preview_vs');
    f_shader = create_shader('preview_fs');
    var pPrg = create_program(v_shader,f_shader);
    var pAttLocation = [];
    pAttLocation[0] = gl.getAttribLocation(pPrg,'position');
    var pAttStride = [];
    pAttStride[0] = 3;
    var pUniLocation = [];
    pUniLocation[0] = gl.getUniformLocation(pPrg, 'time');
    pUniLocation[1] = gl.getUniformLocation(pPrg,'resolution');
    pUniLocation[2] = gl.getUniformLocation(pPrg, 'texture0');
    pUniLocation[3] = gl.getUniformLocation(pPrg, 'texture1');
    pUniLocation[4] = gl.getUniformLocation(pPrg, 'texture2');
    pUniLocation[5] = gl.getUniformLocation(pPrg, 'texture3');
    pUniLocation[6] = gl.getUniformLocation(pPrg, 'texture4');
    pUniLocation[7] = gl.getUniformLocation(pPrg, 'texture5');
    pUniLocation[8] = gl.getUniformLocation(pPrg, 'campos');

    v_shader = create_shader('post_vs');
    f_shader = create_shader('post_fs');
    var poPrg = create_program(v_shader,f_shader);
    var poAttLocation = [];
    poAttLocation[0] = gl.getAttribLocation(poPrg,'position');
    var poAttStride = [];
    poAttStride[0] = 3;
    var poUniLocation = [];
    poUniLocation[0] = gl.getUniformLocation(poPrg, 'time');
    poUniLocation[1] = gl.getUniformLocation(poPrg,'resolution');
    poUniLocation[2] = gl.getUniformLocation(poPrg, 'texture7');
   
    v_shader = create_shader('postpost_vs');
    f_shader = create_shader('postpost_fs');
    var popoPrg = create_program(v_shader,f_shader);
    var popoAttLocation = [];
    popoAttLocation[0] = gl.getAttribLocation(popoPrg,'position');
    var popoAttStride = [];
    popoAttStride[0] = 3;
    var popoUniLocation = [];
    popoUniLocation[0] = gl.getUniformLocation(popoPrg, 'time');
    popoUniLocation[1] = gl.getUniformLocation(popoPrg,'resolution');
    popoUniLocation[2] = gl.getUniformLocation(popoPrg, 'texture0');
    popoUniLocation[3] = gl.getUniformLocation(popoPrg, 'offsetsH');
    popoUniLocation[4] = gl.getUniformLocation(popoPrg, 'weightsH');
    popoUniLocation[5] = gl.getUniformLocation(popoPrg, 'offsetsV');
    popoUniLocation[6] = gl.getUniformLocation(popoPrg, 'weightsV');
    popoUniLocation[7] = gl.getUniformLocation(popoPrg, 'isVertical');

    v_shader = create_shader('bloomout_vs');
    f_shader = create_shader('bloomout_fs');
    var blPrg = create_program(v_shader,f_shader);
    var blAttLocation = [];
    blAttLocation[0] = gl.getAttribLocation(blPrg,'position');
    var blAttStride = [];
    blAttStride[0] = 3;
    var blUniLocation = [];
    blUniLocation[0] = gl.getUniformLocation(blPrg, 'time');
    blUniLocation[1] = gl.getUniformLocation(blPrg,'resolution');
    blUniLocation[2] = gl.getUniformLocation(blPrg, 'texture0');
    blUniLocation[3] = gl.getUniformLocation(blPrg, 'texture7');
    

    var vertex_position = [
      -1.0, 1.0, 0.0,
       1.0, 1.0, 0.0,
      -1.0,-1.0, 0.0,
       1.0,-1.0, 0.0
    ]



    var index = [
         0,2,1,
         1,2,3
    ]

    var position_vbo = create_vbo(vertex_position);

    var vboList = [position_vbo];
    var ibo = create_ibo(index);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);


    startTime = new this.Date().getTime();

    var frameBuffer;
    var frameBuffer2;
    var frameBuffer3;
    var frameBuffer4;

    maketexture();
    function maketexture(){
        frameBuffer3 = create_framebuffer_MRT2(cw,ch);
        frameBuffer4 = create_framebuffer_MRT2(cw,ch);
        frameBuffer5 = create_framebuffer_MRT2(cw,ch);
        frameBuffer = create_framebuffer_MRT(cw,ch);

        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[0]);
        gl.activeTexture(gl.TEXTURE1);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[1]);
        gl.activeTexture(gl.TEXTURE2);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[2]);
        gl.activeTexture(gl.TEXTURE3);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[3]);
        gl.activeTexture(gl.TEXTURE4);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[4]);
        gl.activeTexture(gl.TEXTURE5);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[5]);
        gl.activeTexture(gl.TEXTURE6);


        frameBuffer2 = create_framebuffer_MRT2(cw,ch);

        gl.activeTexture(gl.TEXTURE7);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer2.t[0]);

    }

    var maketextureflag = false;
    
    window.addEventListener("resize", function(){
        getSize();
    });
    
    function getSize(){
        cw = wrapper.clientWidth;
        ch =  wrapper.clientHeight;
        c.width = cw; c.height = ch;
        gl.viewport(0, 0, cw, ch);
        maketextureflag = true;
    }

    var num =0;

    render();

    function render(){
        if(maketextureflag){
            maketexture();
            maketextureflag = false;
        }

        time = (new Date().getTime() - startTime)*0.001;

        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer.f);
            
        var bufferList = [
            ext.COLOR_ATTACHMENT0_WEBGL,
            ext.COLOR_ATTACHMENT1_WEBGL,
            ext.COLOR_ATTACHMENT2_WEBGL,
            ext.COLOR_ATTACHMENT3_WEBGL,
            ext.COLOR_ATTACHMENT4_WEBGL,
            ext.COLOR_ATTACHMENT5_WEBGL
        ];

        ext.drawBuffersWEBGL(bufferList);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(prg);
        set_attribute(vboList,attLocation,attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(uniLocation[0],time+tempTime);
        gl.uniform2fv(uniLocation[1],[cw,ch]);
        var kt = time%35.0;
        var camPosition = [3];
        var radi = 16.3;
        var krt = 0.1*kt;
        camPosition[0] = radi*Math.cos(krt);
        camPosition[1] = 3.*Math.sin(krt);
        camPosition[2] = radi*Math.sin(krt);
        if(kt>16.5){
            camPosition[0] = 25*((kt+4.-16.5)/18)-4;
            camPosition[1] = 2.;
            camPosition[2] = 25*(1.-(kt+4.-16.5)/18)-6;
        }
        gl.uniform3fv(uniLocation[2],camPosition);
        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer2.f);
        
        bufferList = [
            ext.COLOR_ATTACHMENT0_WEBGL
          
        ];
        ext.drawBuffersWEBGL(bufferList);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(pPrg);

        set_attribute(vboList,pAttLocation,pAttStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(pUniLocation[0],time+tempTime);
        gl.uniform2fv(pUniLocation[1],[cw,ch]);
       
        
        gl.uniform1i(pUniLocation[2],0);
        gl.uniform1i(pUniLocation[3],1);
        gl.uniform1i(pUniLocation[4],2);
        gl.uniform1i(pUniLocation[5],3);
        gl.uniform1i(pUniLocation[6],4);
        gl.uniform1i(pUniLocation[7],5);
  
        gl.uniform3fv(pUniLocation[8],camPosition);
        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer3.t[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer3.f);
        
        bufferList = [
            ext.COLOR_ATTACHMENT0_WEBGL
          
        ];
        ext.drawBuffersWEBGL(bufferList);


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(poPrg);

        set_attribute(vboList,poAttLocation,poAttStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(poUniLocation[0],time+tempTime);
        gl.uniform2fv(poUniLocation[1],[cw,ch]);
        gl.uniform1i(poUniLocation[2],7);

        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        
        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer3.t[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer4.f);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(popoPrg);

        set_attribute(vboList,popoAttLocation,popoAttStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(popoUniLocation[0],time+tempTime);
        gl.uniform2fv(popoUniLocation[1],[cw,ch]);
        gl.uniform1i(popoUniLocation[2],0);
        gl.uniform1i(popoUniLocation[7], true);

        gl.uniform2fv(popoUniLocation[5], offsetV);
        gl.uniform1fv(popoUniLocation[6], weightV);

        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer4.t[0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer3.f);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(popoPrg);

        set_attribute(vboList,popoAttLocation,popoAttStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(popoUniLocation[0],time+tempTime);
        gl.uniform2fv(popoUniLocation[1],[cw,ch]);
        gl.uniform1i(popoUniLocation[2],0);
        gl.uniform1i(popoUniLocation[7], false);

        gl.uniform2fv(popoUniLocation[3], offsetH);
        gl.uniform1fv(popoUniLocation[4], weightH);

        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);


        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer3.t[0]);
        

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(blPrg);

        set_attribute(vboList,blAttLocation,blAttStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(blUniLocation[0],time+tempTime);
        gl.uniform2fv(blUniLocation[1],[cw,ch]);
        gl.uniform1i(blUniLocation[2],0);
        gl.uniform1i(blUniLocation[3],7);

        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
      
  
        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[0]);

        gl.flush();
     /*
        var a = document.createElement('a');
        //canvasをJPEG変換し、そのBase64文字列をhrefへセット
        a.href = c.toDataURL('image/jpeg', 0.85);
        //ダウンロード時のファイル名を指定
        var numst = String( num );
        var title = 'download.jpg';
        var str = numst+title
        a.download = str;
        //クリックイベントを発生させる
        a.click();
        num += 1;
        */
        setTimeout(render,fps);
    }

        

    function create_shader(id){
        var shader;
    
        var scriptElement = document.getElementById(id);
    
        if(!scriptElement){return;}
    
        switch(scriptElement.type){
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default :
                return;
    
        }
    
        gl.shaderSource(shader, scriptElement.text);
        gl.compileShader(shader);
    
        if(gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
        }
    
    }
    
    function create_program(vs,fs){
        var program = gl.createProgram();
    
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
    
        gl.linkProgram(program);
    
        if(gl.getProgramParameter(program,gl.LINK_STATUS)){
            
            gl.useProgram(program);
    
            return program;
    
        }else{
            alert(gl.getProgramInfoLog(program));
        }
    }
    
    
    function create_vbo(data){
        var vbo = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    
        return vbo;
    }

    function set_attribute(vbo,attL,attS){
        for(var i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i],attS[i],gl.FLOAT,false,0,0);
        }
    }

    function create_ibo(data){
        var ibo = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    }
    function create_framebuffer_MRT(width,height){

        

        var frameBuffer = gl.createFramebuffer();
        
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    
        var fTexture = [];
    
        for(var i = 0;i<7;++i){
            fTexture[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,fTexture[i]);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.FLOAT,null);
    
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    
            gl.framebufferTexture2D(gl.FRAMEBUFFER,ext.COLOR_ATTACHMENT0_WEBGL+i,gl.TEXTURE_2D,fTexture[i],0);
          
        }



        gl.bindTexture(gl.TEXTURE_2D,null);
        gl.bindRenderbuffer(gl.RENDERBUFFER,null);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        return{
            f:frameBuffer,
            t:fTexture
        }

    }
    function create_framebuffer_MRT2(width,height){

        

        var frameBuffer = gl.createFramebuffer();
        
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    
        var fTexture = [];
    
            fTexture[0] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,fTexture[0]);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.FLOAT,null);
    
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    
            gl.framebufferTexture2D(gl.FRAMEBUFFER,ext.COLOR_ATTACHMENT0_WEBGL,gl.TEXTURE_2D,fTexture[0],0);    
       

   

        gl.bindTexture(gl.TEXTURE_2D,null);
        gl.bindRenderbuffer(gl.RENDERBUFFER,null);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        return{
            f:frameBuffer,

            t:fTexture
        }

    }




}






