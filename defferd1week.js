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
    ch =  wrapper.offsetHeight;
    c.width = cw; c.height = ch;

  
    gl = c.getContext('webgl')||c.getContext('experimental-webgl');
    
    
    var ext = gl.getExtension('WEBGL_draw_buffers');
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
    uniLocation[1] = gl.getUniformLocation(prg,'resolution')
    var attLocation = [];
    attLocation[0] = gl.getAttribLocation(prg,'position');

    var attStride = [];
    attStride[0] = 3;


    v_shader = create_shader('preview_vs');
    f_shader = create_shader('preview_fs');
    var pPrg = create_program(v_shader,f_shader);
    var pAttLocation = [];
    pAttLocation[0] = gl.getAttribLocation(pPrg,'position');
    pAttLocation[1] = gl.getAttribLocation(pPrg,'texCoord');
    var pAttStride = [];
    pAttStride[0] = 3;
    pAttStride[1] = 2;
    var pUniLocation = [];
    pUniLocation[0] = gl.getUniformLocation(pPrg, 'time');
    pUniLocation[1] = gl.getUniformLocation(pPrg,'resolution');
    pUniLocation[2] = gl.getUniformLocation(pPrg, 'texture0');
    pUniLocation[3] = gl.getUniformLocation(pPrg, 'texture1');
    pUniLocation[4] = gl.getUniformLocation(pPrg, 'texture2');
    pUniLocation[5] = gl.getUniformLocation(pPrg, 'texture3');

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
    maketexture();
    function maketexture(){
        frameBuffer = create_framebuffer_MRT(cw,ch);

        gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[0]);
        gl.activeTexture(gl.TEXTURE1);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[1]);
        gl.activeTexture(gl.TEXTURE2);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[2]);
        gl.activeTexture(gl.TEXTURE3);
        this.gl.bindTexture(gl.TEXTURE_2D,frameBuffer.t[3]);
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
            ext.COLOR_ATTACHMENT3_WEBGL
        ];

        ext.drawBuffersWEBGL(bufferList);


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(prg);
        set_attribute(vboList,attLocation,attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
        gl.uniform1f(uniLocation[0],time+tempTime);
        gl.uniform2fv(uniLocation[1],[cw,ch]);
        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

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
        gl.drawElements(gl.TRIANGLES,index.length,gl.UNSIGNED_SHORT,0);

        gl.flush();

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
    
        for(var i = 0;i<4;++i){
            fTexture[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D,fTexture[i]);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    
            gl.framebufferTexture2D(gl.FRAMEBUFFER,ext.COLOR_ATTACHMENT0_WEBGL+i,gl.TEXTURE_2D,fTexture[i],0);
    
        }

        var depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER,depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,width,height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthRenderBuffer);

        gl.bindTexture(gl.TEXTURE_2D,null);
        gl.bindRenderbuffer(gl.RENDERBUFFER,null);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        return{
            f:frameBuffer,
            d:depthRenderBuffer,
            t:fTexture
        }

    }




}






