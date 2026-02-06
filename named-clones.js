(function(Scratch) {
  'use strict';

  class NamedClones {
    constructor() {
      // Stockage des noms de clones par sprite
      this.cloneNames = new WeakMap();
      // Compteur pour générer des IDs uniques
      this.cloneCounter = 0;
    }

    getInfo() {
      return {
        id: 'namedclones',
        name: 'Named Clones',
        color1: '#FF6680',
        color2: '#FF4D6A',
        color3: '#E63E5C',
        blocks: [
          {
            opcode: 'createNamedClone',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create clone named [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'setCloneName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set my clone name to [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'getCloneName',
            blockType: Scratch.BlockType.REPORTER,
            text: 'my clone name'
          },
          {
            opcode: 'isCloneNamed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'am I clone named [NAME]?',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'deleteClonesByName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all clones named [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'countClonesByName',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of clones named [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'getAllCloneNames',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all clone names (comma separated)'
          },
          {
            opcode: 'cloneExists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'clone named [NAME] exists?',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'setCloneVariable',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set clone variable [VAR] to [VALUE]',
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myVar'
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '0'
              }
            }
          },
          {
            opcode: 'getCloneVariable',
            blockType: Scratch.BlockType.REPORTER,
            text: 'clone variable [VAR]',
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myVar'
              }
            }
          },
          {
            opcode: 'deleteAllNamedClones',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all named clones'
          }
        ]
      };
    }

    createNamedClone(args, util) {
      const name = String(args.NAME);
      
      // Créer le clone
      const sprite = util.target;
      const clone = sprite.makeClone();
      
      if (clone) {
        // Initialiser le stockage des données du clone
        if (!this.cloneNames.has(clone)) {
          this.cloneNames.set(clone, {
            name: name,
            variables: {},
            id: ++this.cloneCounter
          });
        } else {
          const data = this.cloneNames.get(clone);
          data.name = name;
        }
      }
    }

    setCloneName(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      
      if (!this.cloneNames.has(target)) {
        this.cloneNames.set(target, {
          name: name,
          variables: {},
          id: ++this.cloneCounter
        });
      } else {
        const data = this.cloneNames.get(target);
        data.name = name;
      }
    }

    getCloneName(args, util) {
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        return this.cloneNames.get(target).name;
      }
      
      return '';
    }

    isCloneNamed(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        return this.cloneNames.get(target).name === name;
      }
      
      return false;
    }

    deleteClonesByName(args, util) {
      const name = String(args.NAME);
      const sprite = util.target.sprite;
      
      // Parcourir tous les clones du sprite
      const clones = sprite.clones.filter(clone => {
        if (this.cloneNames.has(clone)) {
          return this.cloneNames.get(clone).name === name;
        }
        return false;
      });
      
      clones.forEach(clone => {
        clone.dispose();
      });
    }

    countClonesByName(args, util) {
      const name = String(args.NAME);
      const sprite = util.target.sprite;
      let count = 0;
      
      sprite.clones.forEach(clone => {
        if (this.cloneNames.has(clone)) {
          if (this.cloneNames.get(clone).name === name) {
            count++;
          }
        }
      });
      
      return count;
    }

    getAllCloneNames(args, util) {
      const sprite = util.target.sprite;
      const names = new Set();
      
      sprite.clones.forEach(clone => {
        if (this.cloneNames.has(clone)) {
          const name = this.cloneNames.get(clone).name;
          if (name) {
            names.add(name);
          }
        }
      });
      
      return Array.from(names).join(', ');
    }

    cloneExists(args, util) {
      const name = String(args.NAME);
      const sprite = util.target.sprite;
      
      for (const clone of sprite.clones) {
        if (this.cloneNames.has(clone)) {
          if (this.cloneNames.get(clone).name === name) {
            return true;
          }
        }
      }
      
      return false;
    }

    setCloneVariable(args, util) {
      const varName = String(args.VAR);
      const value = args.VALUE;
      const target = util.target;
      
      if (!this.cloneNames.has(target)) {
        this.cloneNames.set(target, {
          name: '',
          variables: {},
          id: ++this.cloneCounter
        });
      }
      
      const data = this.cloneNames.get(target);
      data.variables[varName] = value;
    }

    getCloneVariable(args, util) {
      const varName = String(args.VAR);
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        const data = this.cloneNames.get(target);
        if (varName in data.variables) {
          return data.variables[varName];
        }
      }
      
      return '';
    }

    deleteAllNamedClones(args, util) {
      const sprite = util.target.sprite;
      
      const clones = sprite.clones.filter(clone => {
        return this.cloneNames.has(clone);
      });
      
      clones.forEach(clone => {
        clone.dispose();
      });
    }
  }

  Scratch.extensions.register(new NamedClones());
})(Scratch);
