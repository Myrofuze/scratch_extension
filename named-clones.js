(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  class NamedClones {
    constructor(runtime) {
      this.runtime = runtime;
      // Stockage des noms de clones
      this.cloneNames = new Map();
      this.cloneCounter = 0;
    }

    getInfo() {
      return {
        id: 'namedclones',
        name: 'Named Clones',
        color1: '#FFAB19',
        color2: '#EC9C13',
        color3: '#CF8B17',
        blocks: [
          {
            opcode: 'whenIStartAsNamedClone',
            blockType: Scratch.BlockType.HAT,
            text: 'when I start as a clone named [NAME]',
            isEdgeActivated: false,
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'createNamedCloneOf',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create clone of [TARGET] named [NAME]',
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'cloneTarget'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'myCloneName',
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
            opcode: 'setMyCloneName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set my clone name to [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'deleteNamedClones',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all clones named [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'countNamedClones',
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
            opcode: 'cloneNamedExists',
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
            opcode: 'getAllCloneNames',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all clone names'
          },
          {
            opcode: 'setCloneData',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set clone data [KEY] to [VALUE]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'data'
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '0'
              }
            }
          },
          {
            opcode: 'getCloneData',
            blockType: Scratch.BlockType.REPORTER,
            text: 'clone data [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'data'
              }
            }
          }
        ],
        menus: {
          cloneTarget: {
            acceptReporters: true,
            items: '_getTargets'
          }
        }
      };
    }

    _getTargets() {
      const sprites = this.runtime.targets
        .filter(target => target.isOriginal && !target.isStage)
        .map(target => target.getName());
      
      if (sprites.length === 0) {
        return [''];
      }
      
      return ['_myself_', ...sprites];
    }

    whenIStartAsNamedClone(args, util) {
      const expectedName = String(args.NAME);
      const target = util.target;
      
      // Vérifier si c'est un clone
      if (!target.isOriginal) {
        const targetId = target.id;
        if (this.cloneNames.has(targetId)) {
          const cloneData = this.cloneNames.get(targetId);
          return cloneData.name === expectedName;
        }
      }
      
      return false;
    }

    createNamedCloneOf(args, util) {
      const name = String(args.NAME);
      let targetName = args.TARGET;
      
      // Gérer "myself"
      if (targetName === '_myself_') {
        const sprite = util.target.sprite;
        const clone = sprite.clones[0].makeClone();
        
        if (clone) {
          this.cloneNames.set(clone.id, {
            name: name,
            data: {},
            id: ++this.cloneCounter
          });
        }
        return;
      }
      
      // Trouver le sprite cible
      const targets = this.runtime.targets;
      let targetSprite = null;
      
      for (const target of targets) {
        if (target.isOriginal && !target.isStage && target.sprite.name === targetName) {
          targetSprite = target;
          break;
        }
      }
      
      if (targetSprite) {
        const clone = targetSprite.makeClone();
        if (clone) {
          this.cloneNames.set(clone.id, {
            name: name,
            data: {},
            id: ++this.cloneCounter
          });
        }
      }
    }

    myCloneName(args, util) {
      const target = util.target;
      const targetId = target.id;
      
      if (this.cloneNames.has(targetId)) {
        return this.cloneNames.get(targetId).name;
      }
      
      return '';
    }

    isCloneNamed(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      const targetId = target.id;
      
      if (this.cloneNames.has(targetId)) {
        return this.cloneNames.get(targetId).name === name;
      }
      
      return false;
    }

    setMyCloneName(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      const targetId = target.id;
      
      if (!this.cloneNames.has(targetId)) {
        this.cloneNames.set(targetId, {
          name: name,
          data: {},
          id: ++this.cloneCounter
        });
      } else {
        const cloneData = this.cloneNames.get(targetId);
        cloneData.name = name;
      }
    }

    deleteNamedClones(args, util) {
      const name = String(args.NAME);
      const targets = this.runtime.targets.slice();
      
      for (const target of targets) {
        if (!target.isOriginal && this.cloneNames.has(target.id)) {
          const cloneData = this.cloneNames.get(target.id);
          if (cloneData.name === name) {
            this.runtime.disposeTarget(target);
            this.cloneNames.delete(target.id);
          }
        }
      }
    }

    countNamedClones(args, util) {
      const name = String(args.NAME);
      let count = 0;
      
      for (const target of this.runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target.id)) {
          const cloneData = this.cloneNames.get(target.id);
          if (cloneData.name === name) {
            count++;
          }
        }
      }
      
      return count;
    }

    cloneNamedExists(args, util) {
      const name = String(args.NAME);
      
      for (const target of this.runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target.id)) {
          const cloneData = this.cloneNames.get(target.id);
          if (cloneData.name === name) {
            return true;
          }
        }
      }
      
      return false;
    }

    getAllCloneNames(args, util) {
      const names = new Set();
      
      for (const target of this.runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target.id)) {
          const cloneData = this.cloneNames.get(target.id);
          if (cloneData.name) {
            names.add(cloneData.name);
          }
        }
      }
      
      return Array.from(names).join(', ');
    }

    setCloneData(args, util) {
      const key = String(args.KEY);
      const value = args.VALUE;
      const target = util.target;
      const targetId = target.id;
      
      if (!this.cloneNames.has(targetId)) {
        this.cloneNames.set(targetId, {
          name: '',
          data: {},
          id: ++this.cloneCounter
        });
      }
      
      const cloneData = this.cloneNames.get(targetId);
      cloneData.data[key] = value;
    }

    getCloneData(args, util) {
      const key = String(args.KEY);
      const target = util.target;
      const targetId = target.id;
      
      if (this.cloneNames.has(targetId)) {
        const cloneData = this.cloneNames.get(targetId);
        if (key in cloneData.data) {
          return cloneData.data[key];
        }
      }
      
      return '';
    }
  }

  Scratch.extensions.register(new NamedClones(Scratch.vm.runtime));
})(Scratch);
