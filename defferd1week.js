var c,cw,ch,mx,my,gl,run,eCheck;
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
    c = document.getElementById('canvas');
    cw = 512; ch = 512;
    c.width = cw;
    c.height = ch;

    eCheck = document.getElementById('check');

    
    eCheck.addEventListener('change',checkChange,true);

    /**
     * @type {WebGLRenderingContext}
     */
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
    run = (prg != null);if(!run){this.eCheck.checked=false;}
    uniLocation[0] = gl.getUniformLocation(prg, 'time');
    uniLocation[1] = gl.getUniformLocation(prg,'resolution')
    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(prg,'position');

    var attStride = new Array(2);
    attStride[0] = 3;

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

    set_attribute([position_vbo],attLocation,attStride);

    var ibo = create_ibo(index);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT,0);

    startTime = new this.Date().getTime();

    render();

    function render(){
        if(!run){return;}

        time = (new Date().getTime() - startTime)*0.001;

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(uniLocation[0],time+tempTime);
        gl.uniform2fv(uniLocation[1],[cw,ch]);

        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        gl.flush();

        setTimeout(render,fps);
    }

    function checkChange(e){
        run = e.currentTarget.checked;
        if(run){
            startTime = new Date().getTime();
            render();
        }else{
            tempTime += time;
        }
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
}




