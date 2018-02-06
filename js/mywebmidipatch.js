/*	------------------------------------------------------------------------ */
/* MIDI Patch ���������� */
{

	var numMidiIn=0;
	var numMidiOut=0;
	var ftg1=null;	/* Input ���c�AOutput�����̃e�[�u�� MIDI In to Out*/
	var ftg2=null;	/* Input ���c�AOutput�����̃e�[�u�� System Realtime On/Off*/
	var icount=0;	/* �\���̃��^�[���p*/
	var BrowserOut=0;

	/* MIDI API���N���� */
	window.onload = function()
	{
		navigator.requestMIDIAccess( { sysex: true } ).then( successPatch, failure );
	}

	function successPatch(midiAccess)
	{
		var i=0;
		m=midiAccess;

		if (typeof m.inputs === "function") {
			inputs=m.inputs();
			outputs=m.outputs();
		} else {
			var inputIterator = m.inputs.values();
			inputs = [];
			for (var o = inputIterator.next(); !o.done; o = inputIterator.next()) {
				inputs.push(o.value)
			}

			var outputIterator = m.outputs.values();
			outputs = [];
			for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
				outputs.push(o.value)
			}
		}

		if(input_menu_id!=null) setInputDeviceSelect();
		if(output_menu_id!=null) setOutputDeviceSelect();

		if(m!=null){						//MIDI���g����ꍇ
			numMidiIn = inputs.length;		//MIDI Input �̐�
			numMidiOut = outputs.length;	//MIDI Output�̐�

/*			log.font = "12pt Arial";

			log.innerText +="input_device=";
			log.innerText += numMidiIn;
			log.innerText +="\n";

			for(i=0; i<numMidiIn; i++){
				log.innerText += inputs[i].name;
				log.innerText +="\n";
			}

			log.innerText +="output_device=";
			log.innerText += numMidiOut;
			log.innerText +="\n";
*/

			/* MIDI In �̓��̓|�[�g�AFmidiin�𐶐����� */ 
			for(i=0; i<numMidiIn; i++){
				inputs[i].onmidimessage =handleMIDIMessage2;
			}
		}

		guiInit();	//GUI�̏�����

		alert( "OK MIDI ���g���܂�" );
	}

/* -------------------------------------------------------------------------- */
/*	MIDI ���󂯂����̋��� */
	function handleMIDIMessage2(event) {
		var str=null;
		var i,k;

		if( event.data.length>1) {
//			log.innerText +="*";
//			icount++;
//			if(icount>47){ icount=0; log.innerText +="\n"; }
			goMidiOut(this.id,event);
		}
	}

	function goMidiOut(id,event){
		var i;

		if( event.data[0]>=0xF8 ){	//System RealTime
			if( ftg2.toggle[id]==0 ) return;
		}

		/* MIDI �o�� */
		for(i=0; i<numMidiOut; i++){
			/* Flag�̊m�F */
			if(ftg1.toggle[outputs[i].id][id]==1){
				outputs[i].send(event.data);
			}
		}

	}

/*	------------------------------------------------------------------------ */
	/* �t���O�p�̃o�b�t�@�[ */
	var toggle=null;

/*	------------------------------------------------------------------------ */
	/* GUI */
	var canvas	= null;
	var ctx		= null;
	
	var ixo		=240+100;		//�l�p�̍���̂w�̏ꏊ
	var iyo		=20+50;			//�l�p�̍���̂w�̏ꏊ
	var ixa		=120;			//��̎l�p�̂w�̒���
	var iya		=24;			//��̎l�p�̂x�̒���

	var jxo		=ixo-48;		//������̎l�p�̂w�̏ꏊ

	var itxb	=jxo-ixa;		//��������̂w�̏ꏊ
	var ityb	=iyo+10;		//��������̂x�̏ꏊ
	var itln	=ixa-10;		//������̒����̍ő�

	var jtxb	=ixo+10;		//�㕶����̂w�̏ꏊ
	var jtyb	=iyo-20;		//�㕶����̂x�̏ꏊ

	var jtxb2	=jxo+4;			//F8�\���̈ʒu

	/* GUI�̏����� */
	function guiInit()
	{
		var i,j;
		var ix, iy;

		canvas	= document.getElementById('first');
		ctx		= canvas.getContext('2d');

		ctx.font = "10pt Arial";
	    ctx.textAlign = "left";		//start, end, left, right, center
		ctx.textBaseline = "middle"	//top, middle, bottom

		ftg1 = new FToggleSW(ixo,ixa,iyo,iya,numMidiOut,numMidiIn+1);
		ftg1.fSetCanvas(canvas);
		ftg1.fDraw();
	
		ftg2 = new FToggleSW(jxo,iya,iyo,iya,1,numMidiIn);
		ftg2.fSetCanvas(canvas);
		ftg2.fDraw();

		//MIDI In �̖��O��\��
		ctx.fillStyle = '#dddddd';
		for(i=0; i<numMidiIn; i++){
			ctx.fillText(inputs[i].name, itxb, ityb+inputs[i].id*iya,itln);  
		}
		ctx.fillText("Browser", itxb, ityb+numMidiIn*iya,itln);  
		BrowserOut=numMidiIn;	//Browser�̓��͂��AMidiIn�|�[�g�̎��ɐݒ�

		//MIDI Out�̖��O��\��
		for(i=0; i<numMidiOut; i++){
			ctx.fillText(outputs[i].name, jtxb+outputs[i].id*ixa, jtyb,itln);  
//			ctx.fillText(outputs[i].name, jtxb+i*ixa, jtyb,itln);  
		}

		ctx.fillText("F8", jtxb2,jtyb,itln);
	}

	function sendmidifromBrowser()
	{
		var midievent=document.getElementById("doc_ment").value;
		var len=document.getElementById("doc_ment").textLength;
		var str;
		if(len==0) return;
		var sysex=Array(100);
		var j=0;
		for(var i=0; i<len; i++){
			str="0x";
			str+=midievent.substr(i,2);
			sysex[j]=parseInt(str);
			i+=2;
			j++;
		}
		sysex.length=j;

		/* MIDI �o�� */
		for(i=0; i<numMidiOut; i++){
			/* Flag�̊m�F */
			if(ftg1.toggle[outputs[i].id][BrowserOut]==1){
				outputs[i].send(sysex);
			}
		}

//		output.send(sysex);
		return;
	}
}
