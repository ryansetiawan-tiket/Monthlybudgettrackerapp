**Add your own guidelines here**

---

## ⚠️ CRITICAL - BACKWARD COMPATIBILITY WARNING!

**🚨 WAJIB DIBACA SEBELUM MENGUBAH DATA SCHEMA!**

**BEFORE making ANY changes to:**
- Database schema or data format
- Type definitions for stored data
- Constants that affect data structure
- Enum values for database fields

**👉 YOU MUST READ:**
1. **[BACKWARD_COMPATIBILITY_RULES.md](BACKWARD_COMPATIBILITY_RULES.md)** - Complete rules & guidelines
2. **[/⚠️_BACKWARD_COMPATIBILITY_WARNING.md](/⚠️_BACKWARD_COMPATIBILITY_WARNING.md)** - Root warning file
3. **[/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md](/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md)** - AI mandatory checklist

**⚠️ CRITICAL RULE:**
> **"Jika ada yang butuh backward compatibility, ITU HARUS DI-HANDLE! JANGAN DIABAIKAN!"**

**IF YOU IGNORE THIS → 70% OF DATA WILL BREAK!**  
(Real disaster happened November 8, 2025 - fully documented)

**Quick Checklist:**
```
[ ] Query database to check current data format
[ ] Implement backward compatibility layer
[ ] Test with REAL old data (not just fresh data!)
[ ] Document why compat layer exists
```

**See full documentation in the files above. This is NOT optional!**

---
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
