class Editor {
   constructor(target,commands) {
      this.commands = target;
      this.target = target;
      this.program = [
        "forward",
        "forward",
        {
          "item": "if_flower",
          "first": [
            "forward",
            "forward"
          ],
          "second": []
        },
        {
          "item": "loop",
          "first": [
            "forward"
          ]
        }
      ]
   }

   get program() {
      return this.program;
   }

   render() {

   }
}

